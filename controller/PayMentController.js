// paymentController.js
const paymentService = require('../services/paymentservice');
const dotenv = require('dotenv');
dotenv.config();

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
    
    // Hàm để xử lý webhook
    const handleWebhook = async(req, res) => {
        const { status, orderID } = req.body; 
        console.log('Webhook received:', req.body); 

        if (status === 200) {
            const updateResult = await paymentService.updateOrderStatus(orderID);
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
    
module.exports = {
    createPayment,
    handleWebhook
};
