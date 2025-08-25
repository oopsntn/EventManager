// Controller cho user
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Controller
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); // không trả password
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin user", error: err.message });
  }
};

// Update profile

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    let updateData = { name, phone };

    // Nếu multer upload file avatar
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật profile", error: err.message });
  }
};


