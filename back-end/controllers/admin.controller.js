const Event = require("../models/event");
const User = require("../models/user");
const Registration = require("../models/registration");

const bcrypt = require("bcrypt");

module.exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find({}, "-password -re_token");

    res.status(200).json({
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//get user by ID
module.exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password -re_token -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    //name, email, phone, avatar, role, is_verified, createdAt
    const fommatedUser = {
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatar: user.avatar || null,
      role: user.role,
      is_verified: user.is_verified,
      createdAt: user.createdAt,
    };

    res.status(200).json({ User: fommatedUser });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//Tạo tài khoản cho Organizer: name, email, password, role = "organizer"
module.exports.createAccount = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // Kiểm tra nếu thiếu thông tin
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    // Kiểm tra số điện thoại hợp lệ (nếu có)
    if (phone) {
      const phoneRegex = /^[0-9]{9,12}$/; // chỉ chứa 9-12 chữ số
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          message: "Phone number is invalid",
        });
      }
    }
    //Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "organizer",
      phone: phone || "",
      is_verified: true,
    });

    //Xóa password khỏi res
    const { password: _, ...userData } = newUser.toObject();
    await newUser.save();
    res.status(201).json({
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//Delete user by ID
module.exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    //      const currentUser = req.user;
    //         if (!currentUser || currentUser.role !== "admin") {
    //             return res.status(403).json({
    //                 message: "Access denied. Only admin can delete users."
    //             });
    //         }
    //         // Prevent a user from deleting themselves
    //         if (currentUser._id.toString() === id) {
    //             return res.status(403).json({
    //                 message: "You cannot delete your own account."
    //             });
    //          }
    const existingUser = await User.findByIdAndDelete(id).select(
      "-password -is_verified -__v"
    );
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "User deleted successfully",
      user: existingUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params; // ID user cần đổi role
    const { role } = req.body; // role mới
    //const currentUser = req.user; // user đang đăng nhập (admin thực hiện)

    // Chỉ admin mới được đổi role
    // if (currentUser.role !== "admin") {
    //   return res.status(403).json({
    //     message: "Forbidden: Only admins can change roles."
    //   });
    // }

    // Admin không được đổi role của chính mình
    // if (currentUser._id.toString() === id) {
    //   return res.status(403).json({
    //     message: "Forbidden: Admin cannot change their own role."
    //   });
    // }

    // Các role hợp lệ
    const validRoles = ["user", "organizer", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Role must be: user, organizer, admin.",
      });
    }

    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Cập nhật role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "User role changed successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // Thống kê theo role (chỉ admin, organizer, user)
    const usersByRole = await User.aggregate([
      {
        $match: { role: { $in: ["user", "organizer", "admin"] } },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const roleMap = {
      user: "User",
      organizer: "Organizer",
      admin: "Admin",
    };

    const formattedUsersByRole = usersByRole.map((roleStat) => ({
      role: roleMap[roleStat._id] || `Unknown Role (${roleStat._id})`,
      count: roleStat.count,
    }));

    // Tổng số sự kiện
    const totalEvents = await Event.countDocuments();

    // Tổng số người tham gia dựa trên Registration
    const totalParticipants = await Registration.countDocuments();

    res.status(200).json({
      message: "Dashboard statistics fetched successfully",
      statistics: {
        totalUsers,
        usersByRole: formattedUsersByRole,
        totalEvents,
        totalParticipants,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports.getAllEvent = async (req, res) => {
  try {
    const events = await Event.find();

    res.status(200).json({
      message: "All events fetched successfully",
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

