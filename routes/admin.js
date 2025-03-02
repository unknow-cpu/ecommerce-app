const express = require('express');
const router = express.Router();
const userController = require('../middlewares/userMiddleware');

// Middleware kiểm tra admin
const requireAdmin = userController.checkRole(['admin']);

// Dashboard admin
router.get('/admin/dashboard', requireAdmin, (req, res) => {
  res.render('admin/dashboard', { user: req.session.user });
});

// Quản lý người dùng
router.get('/admin/users', requireAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { users });
});

// Cập nhật role người dùng
router.post('/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    res.redirect('/admin/users');
  } catch (error) {
    res.redirect('/admin/users?error=Cập nhật thất bại');
  }
});

module.exports = router;