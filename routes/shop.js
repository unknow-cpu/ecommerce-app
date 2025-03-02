const express = require('express');
const router = express.Router();
const userController = require('../middlewares/userMiddleware');

// Middleware kiểm tra shop user
const requireShopUser = userController.checkRole(['shopUser']);

// Dashboard cửa hàng
router.get('/shop/dashboard', requireShopUser, (req, res) => {
  res.render('shop/dashboard', { user: req.session.user });
});

// Quản lý sản phẩm
router.get('/shop/products', requireShopUser, async (req, res) => {
  const products = await Product.find({ owner: req.session.user.id });
  res.render('shop/products', { products });
});

module.exports = router;