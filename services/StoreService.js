// services/StoreService.js
const Store = require("../models/Store");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { jwtDecode } = require("jwt-decode");
const axios = require("axios");
const axiosInstance = axios.create({
    baseURL: "https://oauth.pointer.io.vn",
    headers: {
      "Content-Type": "application/json",
    },
  });
  require('dotenv').config();
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
const registerStoreWithEmailPassword = async (email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const storeData = { email, password: hashedPassword };
        console.log('Store data to save:', storeData); // Log thông tin sẽ được lưu
        // Save the initial registration info (email and password only)
        const store = new Store({ email, password: hashedPassword });
        console.log("store ne: "+store);

        // Save the store (without other information)
        await store.save();
        // Send OTP to the store owner's email for verification
        await sendOtp(email);
        


        return { success: true, message: 'OTP sent to email. Please verify.', storeId: store._id };
    } catch (error) {
        console.error('Error saving store:', error);
        throw new Error('Error during registration: ' + error.message);
    }
};

const updateStoreInformation = async (storeId, storeName, avatar, phoneNumber, storeAddress, openingTime, closingTime) => {
    try {
        // Find the store by ID and update the remaining information
        const store = await Store.findById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        // Update store information
        store.storeName = storeName;
        store.avatar = avatar;
        store.phoneNumber = phoneNumber;
        store.storeAddress = storeAddress;
        store.openingTime = openingTime;
        store.closingTime = closingTime;

        // Save the updated store information
        await store.save();

        return { success: true, message: 'Store information updated successfully', store };
    } catch (error) {
        throw new Error('Error updating store information: ' + error.message);
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

        // Nếu đăng nhập thành công nhưng chưa xác thực OTP
        if (!store.isOtpVerified) {
            // Gửi OTP
            await sendOtp(email);
            return { success: true, message: 'Login successful. OTP sent to email.', storeId: store._id };
        }

        // Nếu đã xác thực OTP, tạo token cho lần đăng nhập sau
        const token = jwt.sign({ storeId: store._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return { success: true, message: 'Login successful.', token };
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

        // Xóa OTP và đánh dấu đã xác thực
        store.otp = null;
        store.otpExpire = null;
        store.isOtpVerified = true; // Đánh dấu OTP đã xác thực
        await store.save();

        // Tạo token sau khi xác thực thành công
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
const findOrCreateStore = async (email) => {
    let store = await Store.findOne({ email });
    if (!store) {
        // Create a new user if one doesn't exist
        store = await Store.create({ email });
        console.log("New STORE created:", store); // Log newly created user
    } else {
        console.log("User found:", store); // Log existing user
        // STORE = await STORE.updateMany({name,avatar})
    }
    return store;
};
const updateRevenue = async (storeId, amount) => {
    console.log(storeId,amount)
    try {
        // Kiểm tra xem storeId và amount có hợp lệ hay không
        if (!storeId || isNaN(amount)) {
            throw new Error('Store ID và số tiền hợp lệ là bắt buộc 2');
        }
        // Tìm kiếm và cập nhật balance của cửa hàng
        const updatedStore = await Store.findByIdAndUpdate(
            storeId,
            { $inc: { balance: amount } }, // Trừ balance với giá trị amount
            { new: true } // Trả về bản ghi đã cập nhật
        );

        // Kiểm tra nếu không tìm thấy cửa hàng
        if (!updatedStore) {
            throw new Error('Không tìm thấy cửa hàng với ID đã cho');
        }

        // Trả về cửa hàng đã được cập nhật
        return updatedStore;
    } catch (error) {
        console.error('Lỗi khi cập nhật doanh thu:', error.message);
        throw new Error(error.message); // Ném lỗi lên để controller xử lý
    }
};


module.exports = {
    getInforStore,
    updateStore,
    verifyLoginOtp,
    verifyOtp,
    registerStoreWithEmailPassword,
    updateStoreInformation,
    sendOtp,
    loginStore,
    getRandomStores,
    getAllStores,
    findOrCreateStore,
    updateRevenue,
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
            clientId: process.env.CLIENT_ID_STORE,
            clientSecret: process.env.CLIENT_SECRET_STORE,
            code,
          })
        const response = await axiosInstance.post("/auth/access-token", {
          clientId: process.env.CLIENT_ID_STORE,
          clientSecret: process.env.CLIENT_SECRET_STORE,
          code,
        });
        console.log("data: "+response.data)
        return response.data;

      },
}