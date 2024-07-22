const StoreService = require('../services/StoreService.js');
const mongoose = require('mongoose');

const createStore = async (req, res) => {
    try {
        const {
            Store_name,
            Store_address,
            Store_picture,
            Store_status,
            Store_LoaiKD,
            Store_timeOpen,
            Store_timeClose
        } = req.body;

        // Check if the required fields are provided
        if (!Store_name || !Store_address || !Store_LoaiKD) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The required fields are missing: Store_name, Store_address, Store_LoaiKD'
            });
        }

        // Additional validation can be added here if needed

        // Assume we have a StoreService with a createStore method
        const result = await StoreService.createStore({
            Store_name,
            Store_address,
            Store_picture,
            Store_status,
            Store_LoaiKD,
            Store_timeOpen,
            Store_timeClose
        });

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
};
const getStore = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store id'
            });
        }

        const result = await StoreService.getStore(id);

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
const getAllStores = async (req, res) => {
    try {
        const result = await StoreService.getAllStores();
        
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
module.exports = {
    createStore,
    getStore,
    getAllStores
};