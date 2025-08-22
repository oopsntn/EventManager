const express = require('express');
const router = express.Router();
const user = require('../models/user');
const Registration = require('../models/registration');
const Organizer = require('../models/organizer');
const EventCategory = require('../models/eventCategory');
const Event = require('../models/event');
const Notification = require('../models/notification');
// Lấy danh sách bài viết
router.get("/users", async (req, res) => {
  try {
    const data = await user.find();  
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 