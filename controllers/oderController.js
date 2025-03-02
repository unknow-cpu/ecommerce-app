const Order = require('../models/Order')
const Product = require('../models/Product');


// thêm một vào giỏ hàng
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { items, shippingAddress, note } = req.body;
      const userId = req.user._id; // Lấy từ middleware xác thực

      // 1. Kiểm tra sản phẩm và tính toán tổng tiền
      let total = 0;
      const productUpdates = [];

      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new Error(`Sản phẩm ${item.product} không tồn tại`);
        }

        // Kiểm tra số lượng tồn kho
        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} không đủ số lượng`);
        }

        // Cập nhật giá hiện tại và tính toán
        const price = product.price;
        total += price * item.quantity;
        
        // Lưu thông tin cập nhật tồn kho
        productUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $inc: { stock: -item.quantity } }
          }
        });

        // Cập nhật lại giá trong item
        item.price = price;
      }

      // Thêm phí vận chuyển và thuế
      total += (req.body.shippingFee || 0);

      // 2. Tạo đơn hàng
      const newOrder = new Order({
        user: userId,
        items,
        shippingAddress,
        paymentstatus: 'pending',
        status: 'pending',
        total,
        note
      });

      // 3. Thực hiện transaction
      await Product.bulkWrite(productUpdates, { session });
      const savedOrder = await newOrder.save({ session });
      
      await session.commitTransaction();
      res.status(201).json({
        success: true,
        order: await Order.populate(savedOrder, [
          { path: 'user', select: 'name email' },
          { path: 'items.product', select: 'name price' }
        ])
      });

    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  },

  // Lấy đơn hàng theo ID
  exports.getOrderById = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product', 'name price images');

      if (!order) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy đơn hàng' 
        });
      }

      // Kiểm tra quyền truy cập
      if (req.user.role !== 'admin' && !order.user.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập'
        });
      }

      res.json({ success: true, order });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Cập nhật trạng thái đơn hàng
  exports.updateOrderStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const allowedStatus = ['processing', 'shipped', 'delivered', 'cancelled'];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      ).populate('user', 'name email');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      res.json({ success: true, order });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Cập nhật thất bại'
      });
    }
  },

  // Lấy tất cả đơn hàng (Admin)
  exports.getAllOrders = async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = status ? { status } : {};

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email');

      const count = await Order.countDocuments(filter);

      res.json({
        success: true,
        count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        orders
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Hủy đơn hàng
  exports.cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(req.params.id).session(session);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Chỉ hủy khi ở trạng thái pending
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đơn hàng ở trạng thái hiện tại'
        });
      }

      // Hoàn trả tồn kho
      const productUpdates = order.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } }
        }
      }));

      await Product.bulkWrite(productUpdates, { session });
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true, session }
      );

      await session.commitTransaction();
      res.json({ success: true, order: updatedOrder });

    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  }