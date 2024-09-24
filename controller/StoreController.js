const storeService = require('../services/StoreService.js');
const mongoose = require('mongoose');

const createStore = async (req, res) => {
    try {
        const {
            Store_name,
            Store_address,
            Store_picture,
            Store_status,
            Store_phone,
            Store_LoaiKD,
            Store_timeOpen,
            Store_timeClose,
            userId // Lấy userId từ request body
        } = req.body;

        if (!Store_name || !Store_address || !Store_LoaiKD || !Store_phone || !userId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The required fields are missing: Store_name, Store_address, Store_LoaiKD, !Store_phone, userId'
            });
        }

        const result = await storeService.createStore({
            Store_name,
            Store_address,
            Store_picture,
            Store_status,
            Store_phone,
            Store_LoaiKD,
            Store_timeOpen,
            Store_timeClose,
            userId
        });

        return res.status(200).json(result);
    } catch (e) {
        console.error('Error:', e.message); // Thêm log để kiểm tra lỗi
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

        const result = await storeService.getStore(id);

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
        const { id } = req.params; // Lấy userId từ URL path

        if (!id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'userId is required'
            });
        }

        const result = await storeService.getAllStores(id); // Gọi hàm getAllStores với userId
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};


const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Store_timeOpen,
            Store_timeClose,
            Store_status
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store id'
            });
        }

        const updateFields = {};
        if (Store_timeOpen) updateFields.Store_timeOpen = Store_timeOpen;
        if (Store_timeClose) updateFields.Store_timeClose = Store_timeClose;
        if (Store_status) updateFields.Store_status = Store_status;

        const result = await storeService.updateStore(id, updateFields);

        return res.status(200).json(result);
    } catch (e) {
        console.error('Error:', e.message);
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getAllStoresToLoad = async (req, res) => {
    try {
        const result = await storeService.getAllStoresToLoad();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

module.exports = {
    createStore,
    getStore,
    getAllStores,
    updateStore,
    getAllStoresToLoad // Đảm bảo hàm được export chính xác
};
