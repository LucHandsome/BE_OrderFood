const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        dateOfBirth: { type: Date, required: false },
        gender: { type: String, required: false, enum: ['Nam', 'Nữ'] },
        address: { type: String, required: false},
        phoneNumber: { type: String, required: false},
        password: { type: String, required: false },
        customerName: { type: String, required: false },
        profileImage: { type: String, required: false }
    },
    {
        timestamps: true
    }
);

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;
