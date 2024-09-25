const userService = require('../services/authService');

const saveUserInfo = async (req, res) => {
    const { username, email, role } = req.body;
    try {
        const response = await userService.createUser({ username, email, role });
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    saveUserInfo
};
