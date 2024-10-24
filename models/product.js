const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    Food_name: { type: String, required: true },
    Food_detail: { type: String, required: true },
    Price: { type: Number, required: true },
    Food_picture: { type: String, required: true },
    Food_status:{
        type: String,
        enum: ['Còn', 'Hết'],
        default: 'Còn'
    },
    Store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    categoryID: { 
        type: mongoose.Schema.Types.ObjectId,  // Sử dụng ObjectId để liên kết với ToppingGroup
        ref: 'Category',
        required: true
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
