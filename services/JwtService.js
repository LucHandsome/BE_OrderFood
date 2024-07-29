const jwt = require('jsonwebtoken');

// Hàm tạo access token
const generateAccessToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    return accessToken;
};

// Hàm tạo refresh token
const generateRefreshToken = (payload) => {
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '365d' });
    return refreshToken;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
