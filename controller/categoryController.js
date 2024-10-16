const categoryService = require('../services/categoryService');
const mongoose = require('mongoose');

const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const { storeId } = req.params; // Lấy storeId từ tham số URL

        if (!categoryName || !storeId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Category name and storeId are required'
            });
        }

        const result = await categoryService.createCategory({ categoryName, Store_id: storeId }); // Sửa thành Store_id
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Category name is required'
            });
        }

        const result = await categoryService.updateCategory(id, { categoryName });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await categoryService.deleteCategory(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getAllCategorys = async (req, res) => {
    try {
        const { storeId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store id'
            });
        }

        const result = await categoryService.getAllCategorys(storeId); // Sử dụng categoryService
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getCategoryByID = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await categoryService.getCategoryByID(id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategorys,
    getCategoryByID
};
