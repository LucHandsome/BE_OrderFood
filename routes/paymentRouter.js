// paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/PayMentController');

router.post('/create-payment', paymentController.createPayment);
router.post('/payment-status', paymentController.handleWebhook);

module.exports = router;