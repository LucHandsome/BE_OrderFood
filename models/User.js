const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: false, unique: false },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: false },
    gender: { type: String, required: false, enum: ['Nam', 'Nữ'] },
    address: { type: String, required: false},
    phoneNumber: { type: String, required: false},
    introduce: { type: String, required: false}
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
