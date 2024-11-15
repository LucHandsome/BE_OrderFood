const express = require('express');
const router = express.Router();
const orderController = require('../controller/OrderController');

router.post('/create', orderController.createOrder);
router.get('/pending-orders/:customerId/status', orderController.getOrdersByStatusForCustomer);
router.get('/get-order/:customerId', orderController.getOrdersByCustomerId);
router.get('/get-order-store/:storeId', orderController.getOrdersByStoreId);
router.get('/get-order-driver/:driverId', orderController.getOrdersByDriverId);
router.put('/orders/:orderId/cancel', orderController.cancelOrder);
router.put('/orders/:orderId/accept', orderController.acceptOrder);
router.put('/orders/:orderId/complete', orderController.completeOrder);
router.put('/orders/:orderId/take', orderController.takeOrder);
router.put('/orders/:orderId/ship', orderController.shipOrder);
router.put('/orders/confirm/:orderId', orderController.updateOrderStatusToConfirmed);
router.post('/orders/driver-action', orderController.confirmOrRejectOrderByDriver);
router.get('/orders/assigned/:driverId', orderController.getAssignedOrders);



router.get('/pending-orders', orderController.getPendingOrders);
router.put('/update-order/:orderId', orderController.updateOrder);
router.get('/orders', orderController.getOrdersByDriverAndStatus);
router.get('/orders2', orderController.getOrdersByDriverAndStatus2);
router.get('/orderstore', orderController.getOrdersByStoreAndStatus);
router.get('/orderstore2', orderController.getOrdersByStoreAndStatus2);
router.put('/:id/rate', orderController.updateOrderRatingStatus);

router.get('/donhang/:orderID', orderController.getOrderStatus);
//PressPay
router.post('/presspay/callback', orderController.handlePressPayCallback);


router.get('/revenue/weekly/:storeId', orderController.getWeeklyRevenue);
router.get('/revenue/monthly/:storeId', orderController.getMonthlyRevenue);
router.get('/revenue/yearly/:storeId', orderController.getYearlyRevenue);
module.exports = router;
