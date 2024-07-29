const User = require("../models/TaiKhoanCuaHang.js");
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require("./JwtService.js");

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { email, password, confirmPassword } = newUser;
        
        try {
            const checkUser = await User.findOne({ email });
            if (checkUser !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The email is already registered'
                });
                return;
            }

            const hash = bcrypt.hashSync(password, 10);

            const createdUser = await User.create({
                email,
                password: hash,
                confirmPassword: hash
            });
            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                });
            }
        } catch (e) {
            reject({ status: 'ERR', message: e.message });
        }
    });
};

const loginUser = (UserLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = UserLogin; // Chỉ cần email và password
        
        try {
            const checkUser = await User.findOne({ email });
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The email is not registered'
                });
                return;
            }

            const comparePassword = bcrypt.compareSync(password, checkUser.password);
            if (!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'The password is incorrect'
                });
                return;
            }

            const accessToken = generateAccessToken({ id: checkUser._id, isAdmin: checkUser.isAdmin });
            const refreshToken = generateRefreshToken({ id: checkUser._id, isAdmin: checkUser.isAdmin });

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                accessToken,
                refreshToken,
                userId: checkUser._id // Thêm ID người dùng vào phản hồi
            });
        } catch (e) {
            reject({ status: 'ERR', message: e.message });
        }
    });
};

const checkEmailExists = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e.message);
        }
    });
};

module.exports = {
    createUser,
    loginUser,
    checkEmailExists
};
