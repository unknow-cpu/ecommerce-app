const express = require('express');
const router = express.Router();
const userController = require('../middlewares/userMiddleware');

// Middleware kiểm tra đăng nhập
const requireLogin = userController.checkRole(['memberUser', 'shopUser', 'admin']);

// Profile người dùng
router.get('/profile', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render('user/profile', { user });
});

// Cập nhật thông tin cá nhân
router.put('/profile', requireLogin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user.id,
      { $set: req.body },
      { new: true }
    );
    res.redirect('/profile');
  } catch (error) {
    res.redirect('/profile?error=Cập nhật thất bại');
  }
});

module.exports = router;