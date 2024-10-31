// paymentController.js
const paymentService = require('../services/paymentservice');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Import thêm crypto
const axios = require('axios'); // Import axios để gửi request
dotenv.config();

class PaymentController {
    static async createPayment(req, res) {
        const { amount, currency, message, userID, orderID, returnUrl, orders } = req.body;
        
        // Kiểm tra các tham số bắt buộc
        if (!amount || !currency || !userID || !orderID || !returnUrl) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }
    
        console.log("Received data:", req.body); // Log received data
    
        try {
            // Tạo đơn hàng
            const paymentUrl = await paymentService.PointerServices.createOrder(amount, currency, message, userID, orderID, returnUrl, orders);
            
            // Gửi webhook
            await this.sendWebhook({ status: 200, orderID }); // Gọi phương thức gửi webhook
    
            res.status(200).json({ url: paymentUrl }); // Return the payment URL
        } catch (error) {
            console.error('Error creating payment order:', error.message);
            res.status(500).json({ message: error.message });
        }
    }
    

    static async sendWebhook(data) {
        try {
            const webhookUrl = 'https://order-app-88-037717b27b20.herokuapp.com/api/payment/payment-status';
            const secretKey = process.env.POINTER_SECRET_KEY; // Lấy secret key từ biến môi trường
    
            // Tạo chữ ký
            const signature = this.createSignature(data, secretKey);
            
            const response = await axios.post(webhookUrl, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-pointer-signature': signature, // Thêm chữ ký vào header
                },
            });
            console.log('Webhook sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending webhook:', error.message);
        }
    }
    
    // Hàm tạo chữ ký
    static createSignature(payload, secretKey) {
        const hmac = crypto.createHmac('sha256', secretKey);
        return hmac.update(JSON.stringify(payload)).digest('hex');
    }
    

    // ... Phần còn lại của PaymentController không thay đổi
    static async handleWebhook(req, res) {
        const { status, orderID } = req.body; // Dữ liệu webhook nhận được
        const secretKey = process.env.POINTER_SECRET_KEY; // Lấy secret key từ biến môi trường
    
        console.log('Webhook received:', req.body); // Ghi lại dữ liệu nhận được
    
        // Kiểm tra chữ ký để đảm bảo tính xác thực của webhook
        const signature = req.headers['x-pointer-signature'];
        const isValid = verifySignature(req.body, signature, secretKey);
    
        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(400).send('Invalid webhook signature'); // Phản hồi lỗi nếu chữ ký không hợp lệ
        }
    
        // Chỉ khi chữ ký hợp lệ mới xử lý và gửi phản hồi 200 OK
        try {
            if (status === 200) {
                // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
                const updateResult = await paymentService.PointerServices.updateOrderStatus(orderID);
                if (!updateResult) {
                    console.error(`Order ID ${orderID} not found for update`);
                    return res.status(404).send('Order not found'); // Nếu không tìm thấy đơn hàng
                }
                console.log(`Payment successful for order ID: ${orderID}`);
                return res.status(200).json({ status: 200, orderID }); // Trả về status và orderID
            } else {
                console.log(`Payment failed for order ID: ${orderID}, status: ${status}`);
                return res.status(400).json({ status: status, orderID }); // Trả về status và orderID
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            return res.status(500).send('Error processing webhook.');
        }
    }
    
}
    // Hàm kiểm tra tính hợp lệ chữ ký
    function verifySignature(payload, receivedSignature, secretKey) {
        const hmac = crypto.createHmac('sha256', secretKey);
        const computedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
        return computedSignature === receivedSignature;
    }
module.exports = {
    PaymentController
};
