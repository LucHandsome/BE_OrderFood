const User = require('../models/User');

const createUser = async (userData) => {
    try {
        const newUser = new User(userData);
        await newUser.save();
        return { message: 'User info saved successfully.' };
    } catch (error) {
        throw new Error('Error saving user info: ' + error.message);
    }
};

module.exports = {
    createUser
};
