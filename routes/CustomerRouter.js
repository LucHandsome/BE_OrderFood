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
// Route mới cho đăng nhập qua SSO
router.post('/sign-in-sso', async (req, res) => {
    const { code } = req.body; // Lấy mã code từ body

    // Kiểm tra xem mã code có tồn tại không
    if (!code || typeof code !== 'string' || code.trim() === '') {
        return res.status(400).json({ message: 'Mã code không được cung cấp hoặc không hợp lệ.' });
    }

    try {
        const result = await CustomerController.signInWithSSO(code);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Lỗi khi đăng nhập qua SSO:', error.message || error);
        return res.status(500).json({ message: 'Đăng nhập qua SSO không thành công.' });
    }
});

// router.get('/auth/pointer',CustomerController.signInWithSSO)

module.exports = router;
