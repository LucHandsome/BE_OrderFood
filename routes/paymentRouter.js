// paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/PayMentController');

router.post('/create-payment', paymentController.PaymentController.createPayment);
router.post('/payment-status', paymentController.PaymentController.handleWebhook);

module.exports = router;