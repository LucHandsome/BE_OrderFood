const express = require('express');
const router = express.Router();
const userController = require('../controller/authController');

// Endpoint cho Customer
router.post('/customer', userController.saveUserInfo);

// Endpoint cho Store
router.post('/store', userController.saveUserInfo);

// Endpoint cho Driver
router.post('/driver', userController.saveUserInfo);

module.exports = router;
