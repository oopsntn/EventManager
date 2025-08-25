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
            name: user.name,
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
                name: user.name,
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Invalid phone format" });
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

        const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verifyToken}`;

        // send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Nhận bánh danisa qua EventManager',
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

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('Forgot password request for:', email);
        
        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: "Email không tồn tại trong hệ thống",
                success: false 
            });
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 giờ

        // Lưu token vào database
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        console.log('Reset token generated for user:', user.email);

        // Gửi email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Đặt lại mật khẩu - Music App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
                    <p>Xin chào <strong>${user.name}</strong>,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Đặt lại mật khẩu</a>
                    </div>
                    <p>Hoặc copy link này vào trình duyệt:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 1 giờ.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `
        };

        console.log('Attempting to send email to:', user.email);
        
        await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully to:', user.email);

        res.json({ 
            message: "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
            success: true 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            message: "Lỗi server khi xử lý yêu cầu", 
            error: error.message,
            success: false 
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log('Reset password attempt with token:', token);

        // Tìm user với token hợp lệ và chưa hết hạn
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: "Token không hợp lệ hoặc đã hết hạn",
                success: false 
            });
        }

        // Validate password
        if (!password || password.length < 6) {
            return res.status(400).json({ 
                message: "Mật khẩu phải có ít nhất 6 ký tự",
                success: false 
            });
        }

        // Hash password mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Cập nhật password và xóa reset token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        console.log('Password reset successfully for user:', user.email);

        res.json({ 
            message: "Mật khẩu đã được đặt lại thành công",
            success: true 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            message: "Lỗi server khi đặt lại mật khẩu", 
            error: error.message,
            success: false 
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: new Date() } // Kiểm tra token chưa hết hạn
        });
        // if (user.is_verified == true) {
        //     return res.status(200).json({ message: "Email is already verified" });
        // }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?is_verified=false`)
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }


        user.is_verified = true;
        user.verifyToken = undefined; // Xóa token sau khi xác thực
        user.verifyTokenExpiry = undefined; // Xóa thời gian hết hạn token

        await user.save();
        return res.redirect(`${process.env.FRONTEND_URL}/login?is_verified=true`)
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}