// services/UserService.js
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Dùng để tạo token cho phiên đăng nhập
const cookieParser = require('cookie-parser');

// Cấu hình gửi email (ví dụ với Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thanhluc0606@gmail.com',
        pass: 'euzv hbeg mruw jfxq',
    },
});

// Hàm gửi OTP qua email
// Hàm gửi OTP qua email
 const sendOtp = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP 6 chữ số
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

    let user = await User.findOne({ email });

    if (!user) {
        // Nếu chưa có user, tạo mới với OTP
        user = new User({ email, otp, otpExpiry }); // Thay otpExpire bằng otpExpiry
    } else {
        // Cập nhật OTP nếu user đã tồn tại
        user.otp = otp;
        user.otpExpiry = otpExpiry; // Thay otpExpire bằng otpExpiry
    }

    await user.save();

    // Gửi OTP qua email
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    return { success: true, message: 'OTP sent to email.' };
};


// Hàm đăng ký người dùng với mật khẩu
exports.registerUserWithPassword = async (name, email, password) => {
    try {
        // Tạo người dùng mới với mật khẩu đã được hash
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, name, password: hashedPassword });
        
        await user.save(); // Lưu người dùng vào cơ sở dữ liệu

        // Gửi OTP sau khi tạo người dùng
        await sendOtp(email);

        return { success: true, message: 'User registered successfully. OTP sent to email.', user };
    } catch (error) {
        throw new Error('Error during user registration: ' + error.message);
    }
};

// Hàm xác thực OTP
exports.verifyOtp = async (email, otp) => {
    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return { success: false, message: 'Invalid or expired OTP.' };
        }

        // Xóa OTP sau khi xác thực
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return { success: true, message: 'OTP verified.', userId: user._id }; // Trả về userId để sử dụng trong bước tiếp theo
    } catch (error) {
        throw new Error('Error verifying OTP: ' + error.message);
    }
};

//Đăng nhập
// Hàm đăng nhập người dùng
exports.loginUser = async (email, password) => {
    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Invalid password' };
        }

        // Kiểm tra xem người dùng đã đăng nhập trước đó hay chưa (có cookie không)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { 
            success: true, 
            message: 'Login successful', 
            token 
        };
    } catch (error) {
        throw new Error('Error during login: ' + error.message);
    }
};

// Hàm xác thực OTP trong lần đăng nhập đầu tiên
exports.verifyLoginOtp = async (email, otp) => {
    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return { success: false, message: 'Invalid or expired OTP' };
        }

        // Xóa OTP sau khi xác thực
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Tạo token cho phiên đăng nhập (JWT token)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { 
            success: true, 
            message: 'OTP verified and login successful', 
            token 
        };
    } catch (error) {
        throw new Error('Error verifying OTP: ' + error.message);
    }
};


