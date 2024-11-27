// paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/PayMentController');
const orderService = require('../services/OrderService')
const { getSignatureByUserId } = require('../services/paymentservice')

router.post('/create-payment', paymentController.createPayment);
router.post('/pay-with-connect-wallet', paymentController.createOrderWithConnectedWallet)
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
// router.post('/wallet-connect/:userId', paymentController.connectWallet);
router.post('/connect-status', paymentController.handleWebhookConnectWallet);
router.post('/connect-user-status', paymentController.handleWebhookConnectWalletUser);

router.post('/refund-money/:orderId', paymentController.refund);
router.post('/refund-status', paymentController.handleWebhookRefund);
router.post('/with-draw',paymentController.withDraw)
router.get('/account/:userId', paymentController.getAccountConnectWallet);
router.get('/wallet/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await getSignatureByUserId(userId);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({ signature: result.signature });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
});

module.exports = router;