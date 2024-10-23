// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    storeName: { type: String, required: false, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpire: {type: String},
    avatar: {type: String, required: false},
    phoneNumber: { type: String, required: false},
    storeAddress: { type: String, required: false},
    openingTime: { type: String, required: false },
    closingTime: { type: String, required: false }, 
    storeStatus: { type: String, required: false},
});

const Store = mongoose.model('Store', StoreSchema);
module.exports = Store;
