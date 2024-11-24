// services/UserService.js
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Dùng để tạo token cho phiên đăng nhập
const cookieParser = require('cookie-parser');
require('dotenv').config();





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
const registerUserWithPassword = async (name, email, password) => {
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
const verifyOtp = async (email, otp) => {
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
const loginUser = async (email, password) => {
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
const verifyLoginOtp = async (email, otp) => {
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


// Service to verify the access token and get user profile
const getUserProfile = async (accessToken) => {
    try {
        const userProfile = await pointer.verifyAccessToken({ accessToken, session: false });
        if (!userProfile || !userProfile.email) {
            throw new Error('Invalid user profile');
        }
        return userProfile;
    } catch (error) {
        throw new Error('Failed to verify access token');
    }
};

// Service to find or create a user in the database
const findOrCreateUser = async (email,name,avatar) => {
    let user = await User.findOne({ email });
    if (!user) {
        // Create a new user if one doesn't exist
        user = await User.create({ email, name, avatar });
        console.log("New user created:", user); // Log newly created user
    } else {
        //console.log("User found:", user); // Log existing user
    }
    return user;
};
const updateUserProfile = async (userId, updateData) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true } // Trả về bản ghi đã cập nhật và kiểm tra dữ liệu hợp lệ
        );

        if (!updatedUser) {
            throw new Error('User not found');
        }

        return updatedUser;
    } catch (error) {
        throw error;
    }
};

const getUserProfileFromDB = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password'); 
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw error;
    }
};


const axios = require("axios");
const { jwtDecode } = require("jwt-decode");
const { PointerStrategy } = require("sso-pointer");
const pointer = new PointerStrategy(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);

// const AppError = require("../helpers/handleError");

const axiosInstance = axios.create({
  baseURL: "https://oauth.pointer.io.vn",
  headers: {
    "Content-Type": "application/json",
  },
});
const getAllUsers = async () => {
    try {
        const users = await User.find(); // Lấy tất cả thông tin cửa hàng
        return users;
    } catch (error) {
        throw new Error('Error fetching all users: ' + error.message);
    }
};
module.exports = {
    getUserProfile,
    findOrCreateUser,
    registerUserWithPassword,
    loginUser,
    verifyLoginOtp,
    verifyOtp,
    updateUserProfile,
    getUserProfileFromDB,
    getAllUsers,
    async isTokenExpired(token) {
        try {
          const decoded = jwtDecode(token);
          if (!decoded.exp) {
            return false;
          }
          const currentTime = Math.floor(Date.now() / 1000);
          return decoded.exp < currentTime;
        } catch (error) {
          throw new AppError("Unauthorized", 401);
        }
      },
      async getAccessToken(code) {
        console.log({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            code,
          })
        const response = await axiosInstance.post("/auth/access-token", {
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          code,
        });
        console.log("data: "+response.data)
        return response.data;

      },
      async verifyAccessToken(accessToken){
        return await pointer.verifyAccessToken(accessToken);
      },
};
