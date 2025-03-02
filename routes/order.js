const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, checkRole } = require('../middlewares/userMiddleware');

// Tạo đơn hàng
router.post('/oder', requireAuth, orderController.createOrder);

// Lấy đơn hàng theo ID
router.get('/oder/:id', requireAuth, orderController.getOrderById);

// Cập nhật trạng thái (Admin)
router.put('/oder/:id/status', checkRole(['admin']), orderController.updateOrderStatus);

// Lấy tất cả đơn hàng (Admin)
router.get('/oder', checkRole(['admin']), orderController.getAllOrders);

// Hủy đơn hàng
router.delete('/oder/:id/cancel', requireAuth, orderController.cancelOrder);

module.exports = router;