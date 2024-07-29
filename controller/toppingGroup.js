// controllers/toppingGroupController.js

const ToppingGroupService = require('../services/toppingGroup');
const mongoose = require('mongoose');

const createToppingGroup = async (req, res) => {
    try {
        const { toppingGroupName } = req.body;
        const { storeId } = req.params; // Lấy storeId từ tham số URL

        if (!toppingGroupName || !storeId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping group name and storeId are required'
            });
        }

        const result = await ToppingGroupService.createToppingGroup({ toppingGroupName, storeId });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const updateToppingGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { toppingGroupName } = req.body;

        if (!toppingGroupName) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Topping group name is required'
            });
        }

        const result = await ToppingGroupService.updateToppingGroup(id, { toppingGroupName });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};

const deleteToppingGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await ToppingGroupService.deleteToppingGroup(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};


const getAllToppingGroups = async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store id'
            });
        }

        const result = await ToppingGroupService.getAllToppingGroups(storeId); // Sử dụng ToppingGroupService
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};


const getToppingGroupByID = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await ToppingGroupService.getToppingGroupByID(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};
module.exports = {
    createToppingGroup,
    updateToppingGroup,
    deleteToppingGroup,
    getAllToppingGroups,
    getToppingGroupByID
};
