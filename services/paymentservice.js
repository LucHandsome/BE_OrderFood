// paymentService.js

const Order = require('../models/Order'); // Adjust the path as needed
const accWallet = require('../models/connectWallet')
const Store = require('../models/Store'); // Đảm bảo đã import model Store
const accWalletUser = require('../models/connectWalletUser')
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
    // const connectWallet = async(userId) => {
    //     try {
    //         const partnerId = '66a78d1bc49d6f5b6a59e303'
    //         const returnUrl= 'http://localhost:1306/pointer-wallet'
    //         const res = `https://pointer.io.vn/connect-app?partnerId=${partnerId}&returnUrl=${returnUrl}&userId=${userId}`
    //         return res
    //     } catch (error) {
    //         console.error('Error updating order status:', error);
    //         throw new Error(error.message);
    //     }
    // }
    const createConnectWallet = async(userId,signature) => {
        let wallet = await accWallet.findOne({ userId });
        if (!wallet) {
            // Create a new user if one doesn't exist
            wallet = await accWallet.create({ userId,signature });
            console.log("New accWallet created:", wallet); // Log newly created user
        } else {
            console.log("User found:", user); // Log existing user
        }
        return wallet;
    }
    const createConnectWalletUser = async(userId,signature) => {
        let wallet = await accWalletUser.findOne({ userId });
        if (!wallet) {
            // Create a new user if one doesn't exist
            wallet = await accWalletUser.create({ userId,signature });
            console.log("New accWallet created:", wallet); // Log newly created user
        } else {
            console.log("User found:", user); // Log existing user
        }
        return wallet;
    }
    const refund = async (orderId) => {
        try {
            const res = await pointerPayment.refundMoney(orderId.toString());            
            console.log(res);
            
        } catch (error) {
            console.error('Lỗi khi thực hiện hoàn tiền:', error.message);
        }
    };    
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
            console.log("Updating cancel status for order:", orderID);  // Log kiểm tra
            const result = await Order.findByIdAndUpdate(orderID, { status: "Đã hủy" }, { new: true });
            
            if (!result) {
                console.error('Order not found during updateCancelStatus');
                throw new Error('Order not found');
            }
            console.log("Cancel status updated successfully:", result);
            return result; // Trả về đơn hàng đã cập nhật
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error(error.message);
        }
    }
    const createOrderWithConnectedWallet = async(signature, amount, currency, message, userID, orderID, providerID, returnUrl, orders) => {
        if (!amount || !currency || !userID || !orderID || !returnUrl || !orders || !signature || !providerID) {
            throw new Error('Missing required parameters');
        }

        try {
            const response = await pointerPayment.connectedPayment({
                signature,
                amount,
                currency,
                message,
                userID,
                orderID,
                providerID,
                returnUrl,
                orders,
            });

            
            return response.data
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
    const withDraw = async (email,currency,amount) =>{
        if(!email || !currency || !amount){
            throw new Error('Missing required parameters');
        }
        const res = await pointerPayment.withdrawMoney({email,currency,amount})
        return res
    }
    const getSignatureByUserId = async (userId) => {
        try {
          // Tìm kết quả và chỉ chọn trường 'signature'
          const wallet = await accWallet.findOne({ userId }, 'signature');
      
          if (!wallet) {
            return { success: false, message: 'Signature not found for the given userId' };
          }
      
          return { success: true, signature: wallet.signature };
        } catch (error) {
          console.error("Error fetching signature:", error);
          return { success: false, message: 'Internal Server Error', error };
        }
      };
module.exports = {
    createOrder,
    updateOrderStatus,
    // connectWallet,
    createConnectWallet,
    createConnectWalletUser,
    refund,
    updateStatusRefund,
    updateCancleStatus,
    createOrderWithConnectedWallet,
    withDraw,
    getSignatureByUserId,
};
