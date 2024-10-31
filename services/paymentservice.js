// paymentService.js

const Order = require('../models/Order'); // Adjust the path as needed
const { Pointer } = require("pointer-wallet");
const dotenv = require('dotenv');
dotenv.config()
const pointerPayment = new Pointer(process.env.POINTER_SECRET_KEY);


const axios = require('axios');



class PointerServices {
    static async createOrder(amount, currency, message, userID, orderID, returnUrl, orders) {
        if (!amount || !currency || !userID || !orderID) {
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

    static async updateOrderStatus(orderID) {
      try {
          // Update the order status in the database
          const result = await Order.findByIdAndUpdate(orderID, { paymentStatus: "Đã thanh toán" }, { new: true });
          
          if (!result) {
              throw new Error('Order not found');
          }
          return result;
      } catch (error) {
          throw new Error(error.message);
      }
  }
  
  }
  

module.exports = {
    PointerServices
};
