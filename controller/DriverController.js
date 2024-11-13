const driverService = require('../services/driverService');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Driver = require('../models/Driver')
// Đăng ký
const signUp = async (req, res) => {
    const result = await driverService.signUp(req.body);
    return res.status(result.status === 'OK' ? 201 : 400).json(result);
};

// Đăng nhập
const signIn = async (req, res) => {
    const { email, password } = req.body;
    const result = await driverService.signIn(email, password);
    return res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// Cập nhật thông tin tài xế
const updateDriver = async (req, res) => {
    const { id } = req.params;
    const result = await driverService.updateDriver(id, req.body);
    return res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// Lấy thông tin tài xế theo ID
const getDriverById = async (req, res) => {
    const { id } = req.params;
    const result = await driverService.getDriverById(id);
    return res.status(result.status === 'OK' ? 200 : 400).json(result);
};
const handleSSOCallbackDriver = async (req, res) => {
    const { code } = req.body; // Lưu ý rằng điều này phải phù hợp với cách bạn gửi code từ frontend
   console.log('Received code:', code);

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        // Lấy access token từ authorization code
        const {accessToken,user} = await driverService.getAccessToken(code);
        // if(driverService.isTokenExpired(accessToken)){
            
        // }
        // Lấy thông tin người dùng từ access token
        // const userProfile = await userService.getUserProfile(accessToken);

        // Tìm hoặc tạo một người dùng mới với email từ hồ sơ
        const checkUser = await driverService.findOrCreateDriver(user.email);

        // Tạo token JWT cho người dùng
        const token = jwt.sign({ driverId: checkUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Gửi phản hồi với thông tin người dùng và token
        res.status(200).json({ message: 'User authenticated successfully', checkUser, token, driverId: checkUser._id });
    } catch (error) {
        console.error('Error during SSO callback:', error);
        res.status(500).json({ error: error.message });
    }
};
const updateDriverDetails = async (req, res) => {
    try {
      const { driverId } = req.params;
      const { name, dateOfBirth, gender } = req.body;
  
      // Lấy thông tin tệp từ multer
      const avatar = req.files['profileImage'] ? req.files['profileImage'][0].path : null;
      const driverLicenseNumber = req.files['licenseImage'] ? req.files['licenseImage'][0].path : null;
      const vehicleOwnerNumber = req.files['vehicleDocumentImage'] ? req.files['vehicleDocumentImage'][0].path : null;
  
      // Gọi service để cập nhật thông tin tài xế
      const updatedDriver = await driverService.updateDriverDetails(driverId, {
        name, dateOfBirth, gender, avatar, driverLicenseNumber, vehicleOwnerNumber
      });
  
      res.status(200).json({ message: 'Thông tin tài xế đã được cập nhật', driver: updatedDriver });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Cập nhật thông tin tài xế thất bại' });
    }
  };
  
module.exports = {
    signUp,
    signIn,
    updateDriver,
    getDriverById,
    handleSSOCallbackDriver,
    updateDriverDetails
};
