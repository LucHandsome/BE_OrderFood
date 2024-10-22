// services/StoreService.js
const Store = require("../models/Store");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Cấu hình gửi email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thanhluc0606@gmail.com',
        pass: 'euzv hbeg mruw jfxq',
    },
});

// Hàm gửi OTP qua email
const sendOtp = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Tạo mã OTP 6 chữ số
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

    let store = await Store.findOne({ email });

    if (!store) {
        // Nếu chưa có store, tạo mới với OTP
        store = new Store({ email, otp, otpExpiry });
    } else {
        // Cập nhật OTP nếu store đã tồn tại
        store.otp = otp;
        store.otpExpire = otpExpiry;
    }

    await store.save();

    // Gửi OTP qua email
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    });

    return { success: true, message: 'OTP sent to email.' };
};

// Hàm đăng ký cửa hàng với mật khẩu
const registerStoreWithPassword = async (storeName, email, password, phoneNumber, storeAddress, openingTime, closingTime) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const store = new Store({ email, storeName, password: hashedPassword, phoneNumber, storeAddress, openingTime, closingTime });
        
        await store.save();

        // Gửi OTP sau khi tạo cửa hàng
        await sendOtp(email);

        return { success: true, message: 'Store registered successfully. OTP sent to email.', store };
    } catch (error) {
        throw new Error('Error during store registration: ' + error.message);
    }
};

// Hàm xác thực OTP
const verifyOtp = async (email, otp) => {
    try {
        const store = await Store.findOne({ email });

        if (!store || store.otp !== otp || store.otpExpire < Date.now()) {
            return { success: false, message: 'Invalid or expired OTP.' };
        }

        // Xóa OTP sau khi xác thực
        store.otp = null;
        store.otpExpire = null;
        await store.save();

        return { success: true, message: 'OTP verified.', storeId: store._id };
    } catch (error) {
        throw new Error('Error verifying OTP: ' + error.message);
    }
};

// Hàm đăng nhập
// Hàm đăng nhập
const loginStore = async (email, password) => {
    try {
        const store = await Store.findOne({ email });

        if (!store) {
            return { success: false, message: 'Store not found' };
        }

        const isPasswordValid = await bcrypt.compare(password, store.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Invalid password' };
        }

        // Gửi OTP sau khi đăng nhập thành công
        await sendOtp(email);

        return { success: true, message: 'Login successful. OTP sent to email.',storeId: store._id };
    } catch (error) {
        throw new Error('Error during login: ' + error.message);
    }
};


// Hàm xác thực OTP trong lần đăng nhập đầu tiên
const verifyLoginOtp = async (email, otp) => {
    try {
        const store = await Store.findOne({ email });

        if (!store || store.otp !== otp || store.otpExpire < Date.now()) {
            return { success: false, message: 'Invalid or expired OTP' };
        }

        // Xóa OTP sau khi xác thực
        store.otp = null;
        store.otpExpire = null;
        await store.save();

        // Tạo token cho phiên đăng nhập (JWT token)
        const token = jwt.sign({ storeId: store._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { success: true, message: 'OTP verified and login successful', token };
    } catch (error) {
        throw new Error('Error verifying OTP: ' + error.message);
    }
};
const getInforStore = async (storeId) => {
    try {
        // Tìm cửa hàng theo _id, không phải theo Store_id
        const inforStore = await Store.findById(storeId);

        if (!inforStore) {
            return {
                status: 'ERR',
                message: 'Store not found'
            };
        }

        // Trả về kết quả với trạng thái và dữ liệu nếu tìm thấy
        return {
            status: 'OK',
            message: 'SUCCESS',
            data: inforStore
        };
    } catch (e) {
        // Xử lý lỗi và trả về thông báo lỗi
        return {
            status: 'ERR',
            message: e.message
        };
    }
};

const updateStore = (storeId, updatedFields) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm cửa hàng theo ID
            const store = await Store.findById(storeId);
            if (!store) {
                return reject({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            // Kiểm tra Store_id nếu có
            if (updatedFields.Store_id) {
                const relatedStore = await Store.findById(updatedFields.Store_id);  // Đổi tên biến để tránh trùng lặp
                if (!relatedStore) {
                    return reject({
                        status: 'ERR',
                        message: 'Related store not found'
                    });
                }
            }

            // Cập nhật các trường được cung cấp
            Object.keys(updatedFields).forEach(key => {
                store[key] = updatedFields[key];
            });

            // Lưu thay đổi
            const updatedStore = await store.save();

            // Trả về kết quả
            if (updatedStore) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: updatedStore
                });
            }

        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

const getRandomStores = async () => {
    try {
        const stores = await Store.aggregate([{ $sample: { size: 6 } }]);
        return stores;
    } catch (error) {
        throw new Error('Error fetching random stores: ' + error.message);
    }
};
const getAllStores = async () => {
    try {
        const stores = await Store.find(); // Lấy tất cả thông tin cửa hàng
        return stores;
    } catch (error) {
        throw new Error('Error fetching all stores: ' + error.message);
    }
};
module.exports = {
    getInforStore,
    updateStore,
    verifyLoginOtp,
    verifyOtp,
    registerStoreWithPassword,
    sendOtp,
    loginStore,
    getRandomStores,
    getAllStores
}