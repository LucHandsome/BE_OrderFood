const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    }
});

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
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
