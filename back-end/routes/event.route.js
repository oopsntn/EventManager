const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const Event = require("../models/event");
const Registration = require("../models/registration");
const EventCategory = require("../models/eventCategory");

// Hiển thị danh sách event
router.get('/eventList', eventController.getEvents);

// Lấy tất cả event categories
router.get('/eventCategories', eventController.getAllEventCategories);

// Lấy events của user hiện tại (user là organizer)
router.get('/myEvents/:userId', eventController.getMyEvents);

// Lấy chi tiết event
router.get('/eventDetail/:id', eventController.getEventDetail);

// Lấy danh sách đăng ký của một event
router.get('/eventRegistrations/:id', eventController.getEventRegistrations);

// Tạo event mới
router.post('/createEvent', eventController.createEvent);

// Cập nhật event
router.put('/updateEvent/:id', eventController.updateEvent);

// Xóa event
router.delete('/deleteEvent/:id', eventController.deleteEvent);

// Cập nhật trạng thái đăng ký
router.put('/updateRegistrationStatus/:id', eventController.updateRegistrationStatus);

// Tìm event category theo ID
router.get('/findEventCategory/:id', eventController.getEventCategoryById);

module.exports = router;
