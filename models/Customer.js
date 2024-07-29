const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, required: true, enum: ['Nam', 'Nữ', 'Khác'] }, // Có thể điều chỉnh enum tùy vào yêu cầu của bạn
        password: { type: String, required: true },
        customerName: { type: String, required: true },
        profileImage: { type: String, required: false } // Đây có thể là URL của ảnh
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;
