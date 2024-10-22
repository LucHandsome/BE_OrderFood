const express = require("express");
const router = express.Router();
const StoreController = require('../controller/StoreController.js');

router.post('/verify-otp', StoreController.verifyOtp);
router.post('/register', StoreController.registerStore);
router.post('/login', StoreController.loginStore);
router.post('/verify-login-otp', StoreController.verifyLoginOtp);
router.get('/getInforStore/:storeId',StoreController.getInforStore);
router.put('/updatestore/:storeId',StoreController.updateStore);
router.get('/random', StoreController.getRandomStores);
router.get('/getAllStore', StoreController.getAllStores);
module.exports = router;
