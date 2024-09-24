// models/Store.js
const mongoose = require('mongoose');
const TKCH = require('./TaiKhoanCuaHang'); // Sử dụng tên mô hình 'TKCH'

const StoreSchema = new mongoose.Schema({
    Store_name: { type: String, required: true },
    Store_address: { type: String, required: true },
    Store_picture: { type: String },
    Store_status: { type: String },
    Store_phone: { type: String},
    Store_LoaiKD: { type: String, required: true },
    Store_timeOpen: { type: String },
    Store_timeClose: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'TKCH', required: true } // Sử dụng tên mô hình 'TKCH'
});

const Store = mongoose.model('Store', StoreSchema);
module.exports = Store;
