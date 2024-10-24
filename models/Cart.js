const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho mục sản phẩm trong giỏ hàng
const cartItemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    imageUrl: {
        type: String
    },
    totalPrice: {
        type: Number,
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Store', 
        required: true // Thêm trường này để lưu storeId của sản phẩm
    }
});

// Định nghĩa schema cho giỏ hàng
const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Store', 
        required: true
    },
    storeName: {
        type: String,
        required: true
    },
    storeAddress: {
        type: String,
        required: true
    },
    items: [cartItemSchema], // Sử dụng cartItemSchema cho danh sách sản phẩm
    totalItems: {
        type: Number,
        required: true,
        default: 0 // Đặt giá trị mặc định cho tổng số sản phẩm
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0 // Đặt giá trị mặc định cho tổng giá trị
    }
}, {
    timestamps: true // Tự động thêm trường createdAt và updatedAt
});

// Tạo model từ schema
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
