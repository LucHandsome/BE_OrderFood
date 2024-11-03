const express = require('express');
const router = express.Router();
const orderController = require('../controller/OrderController');

router.post('/create', orderController.createOrder);
router.get('/pending-orders/:customerId/status', orderController.getOrdersByStatusForCustomer);
router.get('/get-order/:customerId', orderController.getOrdersByCustomerId);
router.get('/get-order-store/:storeId', orderController.getOrdersByStoreId);
router.put('/orders/:orderId/cancel', orderController.cancelOrder);
router.put('/orders/:orderId/accept', orderController.acceptOrder);
router.put('/orders/:orderId/complete', orderController.completeOrder);


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
