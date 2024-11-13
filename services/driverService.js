const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');
const axios = require("axios");
const { jwtDecode } = require("jwt-decode");

// const AppError = require("../helpers/handleError");

const axiosInstance = axios.create({
  baseURL: "https://oauth.pointer.io.vn",
  headers: {
    "Content-Type": "application/json",
  },
});
require('dotenv').config();

const signUp = async (driverData) => {
    try {
        const { name, dateOfBirth, phoneNumber, email, password, gender, registeredCity, registrationType } = driverData;

        // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
        const existingDriver = await Driver.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingDriver) {
            return {
                status: 'ERR',
                message: 'Email or phone number already in use'
            };
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newDriver = new Driver({
            name,
            dateOfBirth,
            phoneNumber,
            email,
            password: hashedPassword,
            gender,
            registeredCity,
            registrationType
        });

        await newDriver.save();

        return {
            status: 'OK',
            message: 'Driver created successfully',
            data: newDriver
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};

const signIn = async (email, password) => {
    try {
        // Tìm tài xế bằng email
        const driver = await Driver.findOne({ email });
        if (!driver) {
            return {
                status: 'ERR',
                message: 'Invalid email or password'
            };
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, driver.password);
        if (!isPasswordValid) {
            return {
                status: 'ERR',
                message: 'Invalid email or password'
            };
        }

        // Tạo token
        const token = jwt.sign({ id: driver._id }, 'your_jwt_secret_key', { expiresIn: '1h' });

        return {
            status: 'OK',
            message: 'Sign in successful',
            token,
            driverId: driver._id // Include driverId in the response
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};


const updateDriver = async (id, driverData) => {
    try {
        const { name, dateOfBirth, phoneNumber, email, gender, registeredCity, registrationType } = driverData;

        const updatedDriver = await Driver.findByIdAndUpdate(
            id,
            { name, dateOfBirth, phoneNumber, email, gender, registeredCity, registrationType },
            { new: true }
        );

        if (!updatedDriver) {
            return {
                status: 'ERR',
                message: 'Driver not found'
            };
        }

        return {
            status: 'OK',
            message: 'Driver updated successfully',
            data: updatedDriver
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};

const getDriverById = async (id) => {
    try {
        const driver = await Driver.findById(id);
        if (!driver) {
            return {
                status: 'ERR',
                message: 'Driver not found'
            };
        }

        return {
            status: 'OK',
            message: 'Driver retrieved successfully',
            data: driver
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};
const findOrCreateDriver = async (email) => {
    let driver = await Driver.findOne({ email });
    if (!driver) {
        // Create a new user if one doesn't exist
        driver = await Driver.create({ email });
        console.log("New driver created:", driver); // Log newly created user
    } else {
        // console.log("User found:", user); // Log existing user
        // driver = await Driver.updateMany({name,avatar})
    }
    return driver;
};
const updateDriverDetails = async (driverId, updateData) => {
    try {
        // Cập nhật thông tin tài xế trong cơ sở dữ liệu với các dữ liệu đã gửi lên
        const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, { new: true });
        return updatedDriver;
    } catch (error) {
        throw new Error('Cập nhật thông tin tài xế thất bại');
    }
};
module.exports = {
    signUp,
    signIn,
    updateDriver,
    getDriverById,
    findOrCreateDriver,
    updateDriverDetails,
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
            clientId: process.env.CLIENT_ID_DRIVER,
            clientSecret: process.env.CLIENT_SECRET_DRIVER,
            code,
          })
        const response = await axiosInstance.post("/auth/access-token", {
          clientId: process.env.CLIENT_ID_DRIVER,
          clientSecret: process.env.CLIENT_SECRET_DRIVER,
          code,
        });
        console.log("data: "+response.data)
        return response.data;

      },
};
