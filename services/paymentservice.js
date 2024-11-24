// paymentService.js

const Order = require('../models/Order'); // Adjust the path as needed
const accWallet = require('../models/connectWallet')
const { Pointer } = require("pointer-wallet");
const dotenv = require('dotenv');
dotenv.config();
const pointerPayment = new Pointer(process.env.POINTER_SECRET_KEY);
const axios = require('axios');
const { addYears } = require('date-fns');

    const createOrder = async(amount, currency, message, userID, orderID, returnUrl, orders) => {
        if (!amount || !currency || !userID || !orderID || !returnUrl || !orders) {
            throw new Error('Missing required parameters');
        }

        try {
            const response = await pointerPayment.createPayment({
                amount,
                currency,
                message,
                userID,
                orderID,
                returnUrl,
                orders,
            });

            // Đảm bảo rằng response có thuộc tính 'url'
            if (response && response.url) {
                return response.url; // Trả về URL thanh toán
            } else {
                throw new Error('Invalid response from Pointer API');
            }
        } catch (error) {
            console.error('Error creating payment order:', error);

            // Kiểm tra nếu có thông báo lỗi từ Pointer API
            if (error.response && error.response.data) {
                throw new Error(`Error from Pointer API: ${error.response.data.message || error.message}`);
            } else {
                throw new Error('Error creating payment order: ' + error.message);
            }
        }
    }

    const updateOrderStatus = async(orderID) => {
        try {
            // Update the order status in the database
            const result = await Order.findByIdAndUpdate(orderID, { paymentStatus: "Đã thanh toán" }, { new: true });
            
            if (!result) {
                throw new Error('Order not found');
            }
            return result; // Trả về đơn hàng đã cập nhật
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.message);
        }
    }
    const connectWallet = async(userId) => {
        try {
            const partnerId = '66a78d1bc49d6f5b6a59e303'
            const res = await pointerPayment.connectedPayment({
                userId,
                partnerId,
                returnUrl: 'http://localhost:1306/pointer-wallet'
            })
            return res
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.message);
        }
    }
    const createConnectWallet = async(userId,email,signature) => {
        let wallet = await accWallet.findOne({ email });
        if (!wallet) {
            // Create a new user if one doesn't exist
            wallet = await accWallet.create({ userId,email,signature });
            console.log("New accWallet created:", wallet); // Log newly created user
        } else {
            console.log("User found:", user); // Log existing user
        }
        return wallet;
    }
    const refund = async(orderID) => {
        const res = await pointerPayment.refundMoney(orderID)
        return res
    }
    const updateStatusRefund = async(orderID) => {
        try {
            // Update the order status in the database
            const result = await Order.findByIdAndUpdate(orderID, { hasRefund: true }, { new: true });
            
            if (!result) {
                throw new Error('Order not found');
            }
            return result; // Trả về đơn hàng đã cập nhật
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.message);
        }
    }
    const updateCancleStatus = async(orderID) => {
        try {
            // Update the order status in the database
            const result = await Order.findByIdAndUpdate(orderID, { paymentStatus: "Đã hủy" }, { new: true });
            
            if (!result) {
                throw new Error('Order not found');
            }
            return result; // Trả về đơn hàng đã cập nhật
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.message);
        }
    }
module.exports = {
    createOrder,
    updateOrderStatus,
    connectWallet,
    createConnectWallet,
    refund,
    updateStatusRefund,
    updateCancleStatus
};
