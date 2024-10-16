// models/Store.js
const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    storeName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpire: {type: String},
    avatar: {type: String, required: false},
    phoneNumber: { type: String, required: true},
    storeAddress: { type: String, required: true},
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true }, 
    storeStatus: { type: String, required: false},
});

const Store = mongoose.model('Store', StoreSchema);
module.exports = Store;
