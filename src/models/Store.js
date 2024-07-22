const mongoose = require('mongoose');

const StoreShema = new mongoose.Schema(
    {
        Store_name: { type: String, required: true, unique: true },
        Store_address: { type: String, required: true },
        Store_picture: { type: String, required: true },
        Store_status: { type: String},
        Store_LoaiKD:{ type: String, required: true },
        Store_timeOpen:{ type: String },
        Store_timeClose:{ type: String }
    },
    {
        timestamps: true
    }
);

const Store = mongoose.model('Store', StoreShema);
module.exports = Store;