const driverService = require('../services/driverService');

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

module.exports = {
    signUp,
    signIn,
    updateDriver,
    getDriverById
};
