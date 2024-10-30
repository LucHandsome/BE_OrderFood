const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cart: [{
        type: Array,
        required: true
    }],
    deliveryInfo: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        deliveryTime: {
            type: String,
            required: false
        },
        deliveryDate: {
            type: String,
            required: false
        }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    totalShip: {
        type: Number,
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Chưa thanh toán', 'Đã thanh toán'],
        default: 'Chưa thanh toán'
    },
    status: {
        type: String,
        enum: ['Chờ xác nhận', 'Đã nhận đơn', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
        default: 'Chờ xác nhận'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
