// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    storeName: { type: String, required: false }, // Có thể không yêu cầu
    email: { type: String, required: true, unique: true }, // Yêu cầu email
    password: { type: String, required: false }, // Yêu cầu password
    otp: { type: String }, // Có thể không yêu cầu
    otpExpire: { type: String }, // Có thể không yêu cầu
    avatar: { type: String, required: false }, // Có thể không yêu cầu
    phoneNumber: { type: String, required: false }, // Có thể không yêu cầu
    storeAddress: { type: String, required: false }, // Có thể không yêu cầu
    openingTime: { type: String, required: false }, // Có thể không yêu cầu
    closingTime: { type: String, required: false }, // Có thể không yêu cầu
    storeStatus: { type: String, required: false }, // Có thể không yêu cầu
});

const Store = mongoose.model('Store', StoreSchema);
module.exports = Store;
