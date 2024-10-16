const ToppingService = require('../services/toppingService.js');
const mongoose = require('mongoose');

// Tạo topping
const createTopping = async (req, res) => {
    try {
        const { toppingName, toppingPrice, toppingImage, toppingstatus, categoryID, Store_id } = req.body;

        if (!toppingName || !toppingPrice || !toppingImage || !categoryID || !Store_id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping name, price, image, categoryID, and store ID are required'
            });
        }

        const result = await ToppingService.createTopping({ 
            toppingName, 
            toppingPrice, 
            toppingImage, 
            toppingstatus, 
            categoryID, 
            Store_id 
        });
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
        const data = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid product ID'
            });
        }

        const result = await ToppingService.updateTopping(id,data);
        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if product not found
        }
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
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
            status: 'ERR',
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
            status: 'ERR',
            message: e.message
        });
    }
};

// Lấy topping theo categoryID
const getToppingBycategoryID = async (req, res) => {
    try {
        const { categoryID } = req.params;

        if (!categoryID) {
            console.log('Missing category ID');
            return res.status(400).json({
                status: 'ERR',
                message: 'Category ID is required'
            });
        }

        const result = await ToppingService.getToppingBycategoryID(categoryID);
        console.log('Fetched toppings:', result);
        return res.status(200).json(result);
    } catch (e) {
        console.error('Error in getToppingBycategoryID:', e.message);
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getToppingsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        // Validate store ID format
        if (!mongoose.Types.ObjectId.isValid(storeId)) { // Corrected here
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store ID'
            });
        }

        const result = await ToppingService.getToppingByStore(storeId);

        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if store or products not found
        }

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

module.exports = {
    createTopping,
    updateTopping,
    deleteTopping,
    getAllToppings,
    getToppingBycategoryID,
    getToppingsByStore
};
