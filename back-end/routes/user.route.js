const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars"); // folder lưu avatar
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
// Các route liên quan đến user profile
router.get("/:id", userController.getUserById);
// Cập nhật profile
router.put("/:id/profile", upload.single("avatar"), userController.updateProfile);



module.exports = router;