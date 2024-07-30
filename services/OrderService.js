const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { getIo } = require('../socket'); // Import getIo từ socket.js

const createOrder = async (orderData) => {
    if (!orderData.deliveryInfo || !orderData.deliveryInfo.phone) {
        throw new Error('deliveryInfo.phone is required');
    }
    orderData.status = 'Chờ xác nhận'; // Ensure the initial status is "Chờ xác nhận"
    orderData.driverId = null; // Ensure the initial driverId is null
    
    // Set default paymentStatus if not provided
    if (!orderData.paymentStatus) {
        orderData.paymentStatus = 'Chưa thanh toán';
    }

    const order = new Order(orderData);
    await order.save();

    const io = getIo(); // Get the instance of io
    io.emit('newOrder', order); // Use io to emit the newOrder event
    
    return order;
};

const getPendingOrders = async () => {
    return await Order.find({ status: 'Chờ xác nhận' });
};

const updateOrder = async (orderId, updateData) => {
    return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
};

const findOrdersByDriverAndStatus = async (driverId, status) => {
    try {
        return await Order.find({ driverId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
const findOrdersByDriverAndStatus2 = async (driverId, status) => {
    try {
        return await Order.find({ driverId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

const findOrdersByStoreAndStatus = async (storeId, status) => {
    try {
        return await Order.find({ storeId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
const findOrdersByStoreAndStatus2 = async (storeId, status) => {
    try {
        return await Order.find({ storeId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
//PressPay
const updatePaymentStatus = async (orderID, status) => {
    const paymentStatus = status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán';
    return await Order.findByIdAndUpdate(orderID, { paymentStatus }, { new: true });
};

const getOrderById = async (id) => {
    try {
        const order = await Order.findById(id); // Sử dụng phương thức tìm theo ID của Mongoose

        return order;
    } catch (error) {
        throw new Error(error.message);
    }
};
module.exports = {
    createOrder,
    getPendingOrders,
    updateOrder,
    findOrdersByDriverAndStatus,
    findOrdersByDriverAndStatus2,
    findOrdersByStoreAndStatus,
    findOrdersByStoreAndStatus2,
    updatePaymentStatus,
    getOrderById
};
