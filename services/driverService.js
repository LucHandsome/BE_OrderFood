const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

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

module.exports = {
    signUp,
    signIn,
    updateDriver,
    getDriverById
};
