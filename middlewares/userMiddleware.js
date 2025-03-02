// middlewares/authMiddleware.js
exports.checkRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.session.user?.role)) {
        return res.status(403).render('error', { 
          message: 'Bạn không có quyền truy cập',
          user: req.session.user
        });
      }
      next();
    };
  };
  
  exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  };