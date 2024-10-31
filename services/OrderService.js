const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { getIo } = require('../socket'); 
const { removeCartItems } = require('../services/cartService');

const createOrder = async (orderData) => {
    // Kiểm tra các trường bắt buộc trong deliveryInfo
    if (!orderData.deliveryInfo || !orderData.deliveryInfo.name || !orderData.deliveryInfo.phone || !orderData.deliveryInfo.address) {
        throw new Error('deliveryInfo is required and must include name, phone, and address.');
    }
    
    // Kiểm tra cart có ít nhất một sản phẩm
    if (!orderData.cart || !Array.isArray(orderData.cart) || orderData.cart.length === 0) {
        throw new Error('Cart must contain at least one product.');
    }
    
    // Kiểm tra từng sản phẩm trong cart
    orderData.cart.forEach((item, index) => {
        if (!item.name || !item.image || !item.description || !item.quantity || !item.price) {
            throw new Error(`Cart item at index ${index} is missing required fields.`);
        }
    });
    
    // Thiết lập các giá trị mặc định
    orderData.status = 'Đang tìm tài xế';
    orderData.driverId = null;
    
    if (!orderData.paymentStatus) {
        orderData.paymentStatus = 'Chưa thanh toán';
    }
    
    const order = new Order(orderData);
    await order.save();
    const userId =  orderData.customerId
    const storeId = orderData.storeId
    const productIdsToRemove = orderData.cart.map(item => item.productId.toString());
    await removeCartItems(userId, storeId, productIdsToRemove);//Xóa các món đã được mua trong giỏ hàng

    const io = getIo(); 
    io.emit('newOrder', order);
    
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
}
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
