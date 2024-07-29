const UserService = require('../services/UserService.js');

const createUser = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const reg = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        const isCheckEmail = reg.test(email);

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The input is required'
            });
        } else if (!isCheckEmail) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The input is email'
            });
        } else if (password !== confirmPassword) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The password is not equal to confirm password'
            });
        }

        const result = await UserService.createUser({ email, password, confirmPassword });

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const reg = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        const isCheckEmail = reg.test(email);

        if (!email || !password) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Email and password are required'
            });
        } else if (!isCheckEmail) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid email format'
            });
        }

        const result = await UserService.loginUser({ email, password });

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};
const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await UserService.checkEmailExists(email);

        if (exists) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Email is already in use'
            });
        } else {
            return res.status(200).json({
                status: 'OK',
                message: 'Email is available'
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};


module.exports = {
    createUser,
    loginUser,
    checkEmailExists
};
