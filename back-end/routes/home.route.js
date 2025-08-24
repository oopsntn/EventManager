// routes/home.route.js
const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home.controller");

// GET /api/home
router.get("/", homeController.getAllEvents);
router.get("/:id", homeController.getEventById);

module.exports = router;
