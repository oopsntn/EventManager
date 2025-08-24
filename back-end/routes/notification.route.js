const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');

router.get('/all', notificationController.getAllNotifications);
// Lấy notifications của user
router.get('/user/:userId', notificationController.getUserNotifications);
// Admin tạo notification cho user cụ thể
router.post('/create', notificationController.createNotificationForUser);

// Admin broadcast notification
router.post('/broadcast', notificationController.broadcastNotification);

// Đánh dấu notification đã đọc
router.put('/read/:id', notificationController.markAsRead);

// Đánh dấu tất cả notifications của user đã đọc
router.put('/read-all/:userId', notificationController.markAllAsRead);

// Xóa notification
router.delete('/:id', notificationController.deleteNotification);
module.exports = router;