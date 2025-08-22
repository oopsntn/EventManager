const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/auth');

// Controller cho login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log thông tin đăng nhập để debug
    console.log(`Login attempt: ${email}`);
    
    // Tìm user theo email
    const user = await User.findOne({ email });
    
    // Kiểm tra user có tồn tại không
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: "User not found" });
    }

    // Log thông tin user tìm thấy
    console.log(`User found: ${user.email}`);
    
    // So sánh mật khẩu đã hash
    const isMatch = await bcrypt.compare(password, user.password);
    
    // Log kết quả so sánh mật khẩu
    console.log(`Password match: ${isMatch}`);

    // Kiểm tra mật khẩu
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Tạo payload cho token
    const payload = { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    };

    // Tạo token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

    // Trả về token và thông tin user
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      } 
    });

  } catch (error) {
    // Xử lý lỗi server
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Các controller khác cho user như register, profile, etc.
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new User({
      email,
      password: hashedPassword,
      name
    });

    // Lưu user
    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully",
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name 
      } 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
