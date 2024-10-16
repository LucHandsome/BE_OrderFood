const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).json({ status: 'ERR', message: 'No token provided' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 'ERR', message: 'Invalid token' });
        }

        req.user = user; // Thêm thông tin người dùng vào req
        next();
    });
};

module.exports = authMiddleware;
