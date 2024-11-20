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
    // spicyLevel: { type: Number, min: 0, max: 5 }, // Độ cay: 0-5
    // vegetarian: { type: Boolean, default: false }, // Món chay
    // tags: [{ type: String }],
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
