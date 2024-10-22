const StoreService = require("../services/StoreService");
const mongoose = require('mongoose'); 

const registerStore = async (req, res) => {
    try {
        const { storeName, email, password, phoneNumber, storeAddress, openingTime, closingTime } = req.body;
        
        // Gọi đến service để xử lý logic đăng ký
        const result = await StoreService.registerStoreWithPassword(storeName, email, password, phoneNumber, storeAddress, openingTime, closingTime);

        return res.status(201).json({ 
            success: result.success,
            message: result.message,
            store: result.store
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const loginStore = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Gọi đến service để xử lý đăng nhập
        const result = await StoreService.loginStore(email, password);

        if (!result.success) {
            return res.status(401).json({ success: false, message: result.message });
        }

        // Trả về storeId cùng với message khi đăng nhập thành công
        return res.status(200).json({ 
            success: true, 
            message: result.message, 
            storeId: result.storeId // Trả về storeId
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Gọi đến service để gửi OTP qua email
        const result = await StoreService.sendOtp(email);

        return res.status(200).json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Gọi đến service để xác thực OTP
        const result = await StoreService.verifyOtp(email, otp);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            storeId: result.storeId
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const verifyLoginOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Gọi đến service để xác thực OTP khi đăng nhập
        const result = await StoreService.verifyLoginOtp(email, otp);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        // Trả về token sau khi OTP được xác thực
        res.cookie('token', result.token, { httpOnly: true });
        return res.status(200).json({
            success: true,
            message: result.message,
            token: result.token
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getInforStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        // Validate store ID format
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store ID'
            });
        }

        const result = await StoreService.getInforStore(storeId);

        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if store or products not found
        }

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const updateStore = async (req, res) => {
    try {
        const { storeId } = req.params; // Lấy storeId từ params URL
        const updatedFields = req.body; // Lấy dữ liệu cần cập nhật từ body của request

        // Kiểm tra nếu không có trường dữ liệu nào được gửi để cập nhật
        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'No fields provided to update'
            });
        }

        // Gọi service để cập nhật thông tin cửa hàng
        const result = await StoreService.updateStore(storeId, updatedFields);

        // Nếu có lỗi hoặc cửa hàng không tồn tại
        if (result.status === 'ERR') {
            return res.status(404).json(result); // Trả về lỗi và thông báo
        }

        // Trả về kết quả thành công
        return res.status(200).json(result); // Trả về 200 nếu cập nhật thành công
    } catch (e) {
        // Bắt lỗi nếu có bất kỳ sự cố nào xảy ra trong quá trình thực hiện
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
const getRandomStores = async (req, res) => {
    try {
        const stores = await storeService.getRandomStores();
        res.status(200).json({
            status: 'OK',
            message: 'Successfully fetched random stores',
            data: stores,
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
        });
    }
};
const getAllStores = async (req, res) => {
    try {
        const stores = await storeService.getAllStores();
        res.status(200).json({
            status: 'OK',
            message: 'Successfully fetched all stores',
            data: stores,
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
        });
    }
};
module.exports = {
    getInforStore,
    registerStore,
    loginStore,
    sendOtp,
    verifyOtp,
    verifyLoginOtp,
    updateStore,
    getRandomStores,
    getAllStores
}