// models/Rating.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    customerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    images: [{
        type: String // URL of uploaded image
    }],
    response: {
        type: String, // Store's response to the review
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rating', ratingSchema);
