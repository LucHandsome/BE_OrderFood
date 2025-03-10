const userService = require('../services/UserService');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User')


// Hàm đăng ký người dùng
const registerUser = async (req, res) => {
    const { name, email, password} = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        // Gọi hàm đăng ký người dùng từ service
        const result = await userService.registerUserWithPassword(name, email, password);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Hàm xác thực OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide email and OTP.' });
    }

    try {
        // Gọi hàm xác thực OTP từ service
        const result = await userService.verifyOtp(email, otp);
        if (result.success) {
            // Lưu cookies nếu OTP thành công
            res.cookie('user_auth', result.userId, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.status(200).json({ success: true, message: 'OTP verified. User logged in.', userId: result.userId });
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Hàm đăng nhập và gửi OTP lần đầu nếu không có cookies
const loginWithOtp = async (req, res) => {
    const { email, password } = req.body;

    // Check input data
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    try {
        // Check if user is already authenticated with a cookie
        if (req.cookies['user_auth']) {
            return res.status(200).json({ success: true, message: 'User already authenticated.' });
        }

        // Call the login user function
        const user = await userService.loginUser(email, password);

        // If the login was successful, send OTP only if the user does not have a token
        if (user.success) {
            await userService.sendOtp(email); // Send OTP only if login is successful
            return res.status(200).json({ success: true, message: 'OTP sent to email.' });
        } else {
            return res.status(400).json(user); // Return error message if login fails
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error during login: ' + error.message });
    }
};

// Hàm xác thực OTP khi đăng nhập
const verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide email and OTP.' });
    }

    try {
        // Gọi hàm xác thực OTP từ service
        const result = await userService.verifyLoginOtp(email, otp);
        if (result.success) {
            // Lưu cookies nếu OTP thành công
            res.cookie('user_auth', result.token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.status(200).json({ success: true, message: 'OTP verified and login successful.', token: result.token });
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Hàm đăng xuất và xóa cookie
const logout = (req, res) => {
    res.clearCookie('user_auth');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
//Đang sửa---------------------------------
const handleSSOCallback = async (req, res) => {
    const { code } = req.body; // Lưu ý rằng điều này phải phù hợp với cách bạn gửi code từ frontend
   console.log('Received code:', code);

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // Lấy access token từ authorization code
        const {accessToken,user} = await userService.getAccessToken(code);

        // Lấy thông tin người dùng từ access token
        // const userProfile = await userService.getUserProfile(accessToken);

        
        // Tìm hoặc tạo một người dùng mới với email từ hồ sơ
        const checkUser = await userService.findOrCreateUser(user.email,user.name);

        // Tạo token JWT cho người dùng
        const token = jwt.sign({ userId: checkUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Gửi phản hồi với thông tin người dùng và token
        res.status(200).json({ message: 'User authenticated successfully', checkUser, token, userId: checkUser._id });
    } catch (error) {
        console.error('Error during SSO callback:', error);
        res.status(500).json({ error: error.message });
    }
};
const updateUserProfile = async (req, res) => {
 try {
    const userId = req.params.id;
    const { name, dateOfBirth, gender, address, phoneNumber, introduce } = req.body;

     // Lấy URL ảnh từ multer
     let avatar = req.body.avatar; // Avatar từ form, nếu không tải ảnh mới
     if (req.file && req.file.path) {
       avatar = req.file.path; // URL của ảnh mới từ Cloudinary
     }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, dateOfBirth, gender, address, phoneNumber, introduce, avatar },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật thông tin người dùng' });
  }
};

// Lấy thông tin cá nhân người dùng
const getUserProfileFromDB = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(userId)
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        res.json(user);
      } catch (err) {
        res.status(500).json({ error: 'Lỗi lấy thông tin người dùng' });
      }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            status: 'OK',
            message: 'Successfully fetched all users',
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
        });
    }
};
module.exports = {
    handleSSOCallback,
    registerUser,
    logout,
    verifyLoginOtp,
    loginWithOtp,
    verifyOtp,
    updateUserProfile,
    getUserProfileFromDB,
    getAllUsers
}