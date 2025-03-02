const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register
router.get('/register', (req, res) => res.render('user/register'));
router.post('/register', userController.register);

// Login
router.get('/login', (req, res) => res.render('user/login'));
router.post('/login', userController.login);

// Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('dashboard');
});

// Logout
router.get('/logout', userController.logout);

module.exports = router;