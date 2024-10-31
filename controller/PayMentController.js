// paymentController.js

const paymentService = require('../services/paymentservice');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Import thêm crypto
dotenv.config();

class PaymentController {
    static async createPayment(req, res) {
        const { amount, currency, message, userID, orderID, returnUrl, orders } = req.body;
        console.log("Received data:", req.body); // Log received data

        try {
            const paymentUrl = await paymentService.PointerServices.createOrder(amount, currency, message, userID, orderID, returnUrl, orders);
            res.status(200).json({ url: paymentUrl }); // Return the payment URL
        } catch (error) {
            console.error('Error creating payment order:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

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

        // Đảm bảo rằng chỉ khi chữ ký hợp lệ mới xử lý và gửi phản hồi 200 OK
        try {
            if (status === 200) {
                // Nếu thanh toán thành công, cập nhật trạng thái đơn hàng
                await paymentService.PointerServices.updateOrderStatus(orderID);
                console.log(`Payment successful for order ID: ${orderID}`);
                return res.status(200).json({ status: 200, orderID }); // Trả về status và orderID
            } else {
                console.log(`Payment failed for order ID: ${orderID}, status: ${status}`);
                return res.status(400).json({ status: status, orderID }); // Trả về status và orderID
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Error processing webhook.');
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
