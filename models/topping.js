const mongoose = require('mongoose');

// Topping Schema
const toppingSchema = new mongoose.Schema({
    toppingName: { type: String, required: true },  // Tên của topping
    toppingGroupID: { 
        type: mongoose.Schema.Types.ObjectId,  // Sử dụng ObjectId để liên kết với ToppingGroup
        ref: 'ToppingGroup',
        required: true
    },
    type: { type: String, required: true } // Loại của topping
});

// Tạo model từ schema
const Topping = mongoose.model('Topping', toppingSchema);

module.exports = Topping;