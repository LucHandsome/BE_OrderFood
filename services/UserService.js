const User = require("../models/TaiKhoanCuaHang.js");
const bcrypt = require("bcrypt");
const { gennneralAccessToken, gennneralRefreshToken } = require("./JwtService.js");


const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { email, password, confirmPassword } = newUser;
        
        try {
            const checkUser = await User.findOne({
                email:email
            })
            if(checkUser!==null){
                resolve({
                    status: 'OK',
                    message: 'The email is already'
                })
            }
            const hash = bcrypt.hashSync(password,10)

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
            reject(e.message);
        }
    });
};

const loginUser = (UserLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password, confirmPassword } = UserLogin;
        
        try {
            const checkUser = await User.findOne({
                email:email
            })
            if(checkUser===null){
                resolve({
                    status: 'OK',
                    message: 'The email is not defined'
                })
            }
            const comparePassword = bcrypt.compareSync(password,checkUser.password)
            if(!comparePassword){
                resolve({
                    status: 'OK',
                    message: 'The password or user is incorrect'
                })
            }

            
            const accessToken = await gennneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            const refreshToken = await gennneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })
            console.log('accessToken',accessToken)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                accessToken,
                refreshToken
            });
        } catch (e) {
            reject(e.message);
        }
    });
};
module.exports = {
    createUser,
    loginUser
};
