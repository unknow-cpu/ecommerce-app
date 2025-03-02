const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, address } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.redirect('/register?error=Tài khoản hoặc email đã tồn tại');
    }

    const newUser = new User({ 
      name,
      username,
      email,
      password, // Sẽ được hash tự động từ pre-save hook
      address,
      // Role mặc định là memberUser
    });

    await newUser.save();
    res.redirect('/login');

  } catch (error) {
    console.error(error);
    res.redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }
};


// Cập nhật phương thức login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.redirect('/login?error=Thông tin đăng nhập không chính xác');
    }
    
    req.session.user = {
      id: user._id,
      name: user.name,
      role: user.role
    };
    
    res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');

  } catch (error) {
    console.error(error);
    res.redirect('/login?error=Lỗi đăng nhập');
  }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect('/login');
    });
  };