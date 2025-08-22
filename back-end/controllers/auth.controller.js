const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { SECRET_KEY } = require('../middleware/auth');

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
        if (!user.is_verified) {
            return res.status(403).json({ message: "Email not verified" });
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

const generateVerifyToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD
    }
});

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" })
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        //verify token
        const verifyToken = generateVerifyToken();
        const verifyTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); //1 giờ
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            avatar: "/uploads/default-avatar.png",
            role: "user",
            is_verified: false,
            verifyToken: verifyToken,
            verifyTokenExpiry: verifyTokenExpiry
        });

        //Save user to database
        await newUser.save();

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

        // send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Xác nhận email đăng ký',
            html: `<p>Chào ngài ${name},</p>
                 <p>Cảm ơn ngài đã bỏ thời gian đăng ký. Click vào đường link để xác nhận ngài muốn dùng sản phẩm của chúng tôi :</p>
                 <a href="${verificationLink}">Nhận bánh danisa</a>
                 <p>Link có 1 giờ thôi, ấn nhanh thì được.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({
            message: "Registration pending. Please verify your email.",
            user: {
                id: newUser._id,
                email: newUser.email
            }
        })
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: new Date() } // Kiểm tra token chưa hết hạn
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }
        user.is_verified = true;
        user.verifyToken = undefined; // Xóa token sau khi xác thực
        user.verifyTokenExpiry = undefined; // Xóa thời gian hết hạn token

        await user.save();
        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}