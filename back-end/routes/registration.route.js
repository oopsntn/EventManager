// routes/registration.route.js
const express = require("express");
const router = express.Router();
const regController = require("../controllers/registration.controller");

router.post("/", regController.registerEvent);                // Create
router.get("/:userId", regController.getUserRegistrations);   // Read
router.delete("/", regController.cancelRegistration);         // Delete

module.exports = router;
