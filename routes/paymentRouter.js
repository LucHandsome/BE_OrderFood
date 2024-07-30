// paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controller/PayMentController');

router.post('/payment-status', paymentController.handlePaymentStatus);
router.post('/create-payment', paymentController.createPaymentTransaction);

module.exports = router;
