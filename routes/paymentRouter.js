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
router.post('/wallet-connect', async (req, res) => {
    try {
      const { partnerId, returnUrl } = req.body;
  
      // Kiểm tra đối tác hợp lệ
      const partner = await db.Partners.findOne({ where: { id: partnerId } });
      if (!partner) {
        return res.status(400).json({ message: 'Invalid partnerId' });
      }
  
      // Tạo URL chuyển hướng đến Pointer System
      const pointerUrl = `https://pointer-system.com/connect?partnerId=${partnerId}&returnUrl=${encodeURIComponent(returnUrl)}`;
  
      res.status(200).json({ redirectUrl: pointerUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;