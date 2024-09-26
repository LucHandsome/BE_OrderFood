const crypto = require('crypto');

// Tạo một chuỗi ngẫu nhiên dài 32 bytes và mã hóa thành hex
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:', jwtSecret);
