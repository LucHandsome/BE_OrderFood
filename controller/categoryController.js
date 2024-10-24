const categoryService = require('../services/categoryService');
const mongoose = require('mongoose');

const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if (!categoryName) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Category name and storeId are required'
            });
        }

        const result = await categoryService.createCategory({ categoryName }); // Sửa thành Store_id
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

const getAllCategories = async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories();  // Gọi service để lấy dữ liệu
      res.status(200).json(categories);  // Trả về danh sách các danh mục
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh mục: ' + error.message });
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
    getAllCategories,
    getCategoryByID
};
