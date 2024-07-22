const ProductService = require('../services/ProductService');
const StoreService = require('../services/StoreService')
const mongoose = require('mongoose');
const createProduct = async (req, res) => {
    try {
        const {
            Food_id,
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id
        } = req.body;

        // Kiểm tra xem các trường bắt buộc đã được cung cấp chưa
        if (!Food_id || !Food_name || !Food_detail || !Price || !Food_picture || !Store_id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The required fields are missing: Food_id, Food_name, Food_detail, Price, Food_picture, Store_id'
            });
        }

        // Gọi dịch vụ tạo sản phẩm mới
        const result = await ProductService.createProduct({
            Food_id,
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id
        });

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;

        // Gọi dịch vụ cập nhật sản phẩm
        const result = await ProductService.updateProduct(id, updatedFields);

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
const getAllProduct = async (req, res) => {
    try {
        const result = await ProductService.getAllProduct();
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid product id'
            });
        }

        const result = await ProductService.deleteProduct(id);

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};
module.exports = {
    createProduct,
    updateProduct,
    getAllProduct,
    deleteProduct
};
