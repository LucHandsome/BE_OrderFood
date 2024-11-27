// paymentController.js
const paymentService = require('../services/paymentservice');
const dotenv = require('dotenv');
dotenv.config();
const orderService = require('../services/OrderService');
const { Pointer } = require("pointer-wallet");
const pointerPayment = new Pointer(process.env.POINTER_SECRET_KEY);
const { calculateRevenue, calculateRevenueAfterRefund } = require('../services/OrderService');
const accWallet = require('../models/connectWallet')

const getAccountConnectWallet = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ params
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const acc = await accWallet.findOne({ userId }); 
        if (!acc) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.status(200).json(acc); // Trả về dữ liệu nếu tìm thấy
    } catch (error) {
        console.error("Error fetching account:", error);
        res.status(500).json({ message: "Internal server error" }); // Trả về lỗi nếu xảy ra lỗi hệ thống
    }
};

const createPayment = async (req, res) => {
    const { amount, currency, message, userID, orderID, returnUrl, orders } = req.body;

    // Kiểm tra các tham số đầu vào
    if (!amount || !currency || !message || !userID || !orderID || !returnUrl || !orders) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    console.log("Received data:", req.body); // Log received data

    try {
        // Tạo đơn hàng
        const paymentUrl = await paymentService.createOrder(amount, currency, message, userID, orderID, returnUrl, orders);
        res.status(200).json({ url: paymentUrl }); // Return the payment URL
    } catch (error) {
        console.error('Error creating payment order:', error.message);
        res.status(500).json({ message: error.message });
    }
};
const createOrderWithConnectedWallet = async (req, res) => {
    const { signature, amount, currency, message, userID, orderID, providerID, returnUrl, orders } = req.body;

    // Kiểm tra các tham số đầu vào
    if (!amount || !currency || !message || !userID || !orderID || !returnUrl || !orders || !providerID) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    console.log("Received data:", req.body); // Log received data

    try {
        // Tạo đơn hàng
        const response = await paymentService.createOrderWithConnectedWallet(signature, amount, currency, message, userID, orderID, providerID, returnUrl, orders);
        console.log(response)
        return res.status(200).json(response); // Return the payment URL

    } catch (error) {
        console.error('Error creating payment order:', error.message);
        res.status(500).json({ message: error.message });
    }
};
// calculateRevenue();

// const connectWallet = async (req, res) => {
//     const {userId} = req.body
//     const connectUrl = await paymentService.connectWallet(userId)
//     return connectUrl
// }

// Hàm để xử lý webhook
const handleWebhook = async (req, res) => {
    const { status, orderID } = req.body;
    console.log('Webhook received:', req.body);

    if (status === 200) {
        const updateResult = await paymentService.updateOrderStatus(orderID);
        const rs = await orderService.getOrderById(orderID);
        const storeId = rs.storeId;
        const amount = rs.totalPrice * 0.8
        await calculateRevenue(storeId, amount)
        if (!updateResult) {
            console.error(`Order ID ${orderID} not found`);
            return res.status(404).send('Order not found');
        }
        console.log(`Payment successful for order ID: ${orderID}`);
        return res.status(200).json({ status: 200, orderID });
    } else {
        console.log(`Payment failed for order ID: ${orderID}, status: ${status}`);
        return res.status(400).json({ status: status, orderID });
    }
}
const handleWebhookConnectWallet = async (req, res) => {
    const { status, signature, userID } = req.body
    console.log("User Id : " + userID)
    if (status === 200) {
        const accWallet = paymentService.createConnectWallet(userID, signature)
        res.status(200).json({ message: 'Connect Wallet successfully', accWallet, userId: accWallet._id });
    }
}
const handleWebhookConnectWalletUser = async (req, res) => {
    const { status, signature, userID } = req.body
    console.log("User Id : " + userID)
    if (status === 200) {
        const accWallet = paymentService.createConnectWalletUser(userID, signature)
        res.status(200).json({ message: 'Connect Wallet successfully', accWallet, userId: accWallet._id });
    }
}
const refund = async (req, res) => {
    const { orderId } = req.params
    const result = await paymentService.refund(orderId);
    res.status(200).json({ result })
}
const handleWebhookRefund = async (req, res) => {
    const { status, orderID } = req.body;
    console.log("Webhook status: " + status)
    console.log("Webhook orderId: " + orderID)

    if (status === 200) {
        const updateResult = await paymentService.updateStatusRefund(orderID);
        const cancelResult = await paymentService.updateCancleStatus(orderID);
        const rs = await orderService.getOrderById(orderID);
        const storeId = rs.storeId;
        const amount = rs.totalPrice * 0.8
        await calculateRevenueAfterRefund(storeId, amount)
        if (!updateResult || !cancelResult) {
            console.error(`Order ID ${orderID} not found or update failed`);
            return res.status(404).send('Order not found or update failed');
        }

        console.log(`Payment successful and order cancelled for order ID: ${orderID}`);
        return res.status(200).json({ status: 200, orderID });
    }
}
const withDraw = async (req, res) => {
    const { email, currency, amount } = req.body;
    console.log(email)
    const response = await paymentService.withDraw(email, currency, amount);
    res.status(200).json(response)
}
module.exports = {
    createPayment,
    handleWebhook,
    // connectWallet,
    handleWebhookConnectWallet,
    handleWebhookConnectWalletUser,
    refund,
    handleWebhookRefund,
    createOrderWithConnectedWallet,
    withDraw,
    getAccountConnectWallet
};
