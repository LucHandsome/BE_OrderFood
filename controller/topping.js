const ToppingService = require('../services/toppingService.js');

// Tạo topping
const createTopping = async (req, res) => {
    try {
        const { toppingName, type } = req.body;

        if (!toppingName || !type) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping name and type are required'
            });
        }

        const result = await ToppingService.createTopping({ toppingName, type });
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in createTopping controller:', e); // Thêm thông tin log
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};


// Cập nhật topping
const updateTopping = async (req, res) => {
    try {
        const { id } = req.params;
        const { toppingName, toppingGroupID } = req.body;

        if (!toppingName || !toppingGroupID) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping name and topping group ID are required'
            });
        }

        const result = await ToppingService.updateTopping(id, { toppingName, toppingGroupID });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};

// Xóa topping
const deleteTopping = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await ToppingService.deleteTopping(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};

// Lấy tất cả topping
const getAllToppings = async (req, res) => {
    try {
        const result = await ToppingService.getAllToppings();
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};

const getToppingByToppingGroupID = async (req, res) => {
    try {
        const { toppingGroupID } = req.params;

        if (!toppingGroupID) {
            console.log('Missing topping group ID');
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping group ID is required'
            });
        }

        const result = await ToppingService.getToppingByToppingGroupID(toppingGroupID);
        console.log('Fetched toppings:', result);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getToppingByToppingGroupID:', e.message);
        return res.status(500).json({
            message: e.message
        });
    }
};

module.exports = {
    createTopping,
    updateTopping,
    deleteTopping,
    getAllToppings,
    getToppingByToppingGroupID
};
