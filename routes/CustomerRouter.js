const express = require('express');
const router = express.Router();
const CustomerController = require('../controller/CustomerController');

// Đăng ký khách hàng
router.post('/sign-up', CustomerController.signUpCustomer);

// Đăng nhập khách hàng
router.post('/sign-in', CustomerController.signInCustomer);

// Cập nhật thông tin khách hàng
router.put('/update/:customerId', CustomerController.updateCustomer);

// Lấy thông tin khách hàng theo ID
router.get('/:customerId', CustomerController.getCustomerById);

// Lấy tất cả khách hàng
router.get('/', CustomerController.getAllCustomers);

module.exports = router;
