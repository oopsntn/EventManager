const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

// Route đăng nhập
router.post('/login', userController.login);

// Route đăng ký
router.post('/register', userController.register);

// Các route khác yêu cầu xác thực
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
