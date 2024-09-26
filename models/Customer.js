const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        dateOfBirth: { type: Date, required: false },
        gender: { type: String, required: false, enum: ['Nam', 'Nữ', 'Khác'] },
        password: { type: String, required: false },
        customerName: { type: String, required: true },
        profileImage: { type: String, required: false }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;
