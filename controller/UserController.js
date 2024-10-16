const userService = require('../services/UserService');

// Hàm đăng ký người dùng
exports.registerUser = async (req, res) => {
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
exports.verifyOtp = async (req, res) => {
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
exports.loginWithOtp = async (req, res) => {
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
exports.verifyLoginOtp = async (req, res) => {
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
exports.logout = (req, res) => {
    res.clearCookie('user_auth');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
