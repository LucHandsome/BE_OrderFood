// paymentService.js

const Order = require('../models/Order'); // Adjust the path as needed

const updateOrderStatus = async (orderID) => {
    try {
        // Assuming you have an Order model with an update method
        const result = await Order.findByIdAndUpdate(orderID, {paymentStatus: "Đã thanh toán" });
        return result
    } catch (error) {
        throw new Error(error.message);
    }
};

const axios = require('axios');

const initiatePayment = async (private_key, amount, currency, message, userID, orderID, return_url) => {
    const baseUrl = 'https://presspay-api.azurewebsites.net';
    const endpoint = '/api/v1/payment';
    
    try {
        const response = await axios.post(`${baseUrl}${endpoint}`, {
            private_key,
            amount,
            currency,
            message,
            userID,
            orderID,
            return_url
        });

        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    updateOrderStatus,
    initiatePayment
};
