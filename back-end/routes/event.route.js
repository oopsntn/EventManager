const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const Event = require("../models/event");
const Registration = require("../models/registration");
const EventCategory = require("../models/eventCategory");
// hien thi danh sach event
router.get('/getAllEvent', eventController.getEvents);
router.get('/getEventDetail', eventController.getEventDetail);

router.post('/createEvent', eventController.createEvent);
router.put('/updateEvent/:id', eventController.updateEvent);
router.delete('/deleteEvent/:id', eventController.deleteEvent);
router.get('/findEventCategory/:id', eventController.getEventCategoryById);
module.exports = router;
