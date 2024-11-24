// paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/PayMentController');
const orderService = require('../services/OrderService')

router.post('/create-payment', paymentController.createPayment);
router.post('/payment-status', paymentController.handleWebhook);
router.get('/payment-status/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await orderService.getOrderById(orderId); // Giả sử bạn có hàm này
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.status === 'Đã thanh toán') {
            res.status(200).send(`Thanh toán thành công cho đơn hàng ${orderId}`);
        } else {
            res.status(400).send(`Thanh toán thất bại hoặc đang chờ xử lý cho đơn hàng ${orderId}`);
        }
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/wallet-connect/:userId', paymentController.connectWallet);
router.post('/connect-status', paymentController.handleWebhookConnectWallet);
router.post('/refund-money/:orderId', paymentController.refund);
router.post('/refund-status', paymentController.handleWebhookRefund);

module.exports = router;