const express = require('express');
const router = express.Router();
const orderController = require('../controller/OrderController');

router.post('/create', orderController.createOrder);
router.get('/pending-orders', orderController.getPendingOrders);
router.put('/update-order/:orderId', orderController.updateOrder);
router.get('/orders', orderController.getOrdersByDriverAndStatus);
router.get('/orders2', orderController.getOrdersByDriverAndStatus2);
router.get('/orderstore', orderController.getOrdersByStoreAndStatus);
router.get('/orderstore2', orderController.getOrdersByStoreAndStatus2);

router.get('/donhang/:orderID', orderController.getOrderStatus);
//PressPay
router.post('/presspay/callback', orderController.handlePressPayCallback);
module.exports = router;
