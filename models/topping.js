const mongoose = require('mongoose');

// Topping Schema
const toppingSchema = new mongoose.Schema({
    toppingName: { type: String, required: true },  // Tên của topping
    toppingPrice: { type: String, require: true},
    toppingImage: { type: String, require: true},
    toppingstatus: {
        type: String,
        enum: ['Còn', 'Hết'],
        default: 'Hết'
    },
    categoryID: { 
        type: mongoose.Schema.Types.ObjectId,  // Sử dụng ObjectId để liên kết với ToppingGroup
        ref: 'Category',
        required: true
    },
    Store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
});

// Tạo model từ schema
const Topping = mongoose.model('Topping', toppingSchema);

module.exports = Topping;