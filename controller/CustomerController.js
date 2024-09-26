const CustomerService = require('../services/CustomerService');

const signUpCustomer = async (req, res) => {
    try {
        const result = await CustomerService.signUpCustomer(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signInCustomer = async (req, res) => {
    try {
        const result = await CustomerService.signInCustomer(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const result = await CustomerService.updateCustomer(customerId, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.params;
        const result = await CustomerService.getCustomerById(customerId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const result = await CustomerService.getAllCustomers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controller xử lý đăng nhập qua SSO
const signInWithSSO = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Mã code không được cung cấp.' });
        }

        const result = await CustomerService.signInWithSSO(code);
        
        // Thay vì trả về JSON, redirect đến dashboard
        res.redirect(`https://project-order-food.vercel.app/restaurantlist?token=${result.token}`);
    } catch (error) {
        console.error('Lỗi khi xác thực SSO:', error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    signUpCustomer,
    signInCustomer,
    updateCustomer,
    getCustomerById,
    getAllCustomers,
    signInWithSSO 
};
