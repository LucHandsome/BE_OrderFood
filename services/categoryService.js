const Category = require('../models/category');
const mongoose = require('mongoose');

// Create new category
const createCategory = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newCategory = new Category(data); // Sử dụng model Category
            const savedCategory = await newCategory.save();
            resolve({
                status: 'OK',
                message: 'Category created successfully',
                data: savedCategory
            });
        } catch (error) {
            console.error('Error creating Category:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Update existing category
const updateCategory = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true }); // Sử dụng model Category
            if (!updatedCategory) {
                resolve({
                    status: 'ERR',
                    message: 'Category not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Category updated successfully',
                    data: updatedCategory
                });
            }
        } catch (error) {
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Delete category
const deleteCategory = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedCategory = await Category.findByIdAndDelete(id); // Sử dụng model Category
            if (!deletedCategory) {
                resolve({
                    status: 'ERR',
                    message: 'Category not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Category deleted successfully'
                });
            }
        } catch (error) {
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Get all categories by store ID
const getAllCategorys = (store_Id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const categories = await Category.find({ Store_id: store_Id }); // Sử dụng Store_id thay vì storeId
            resolve({
                status: 'OK',
                message: 'Categories fetched successfully',
                data: categories
            });
        } catch (error) {
            console.error('Error fetching Categories:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Get category by ID
const getCategoryByID = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return reject({
                    status: 'ERR',
                    message: 'Invalid ID format'
                });
            }

            const category = await Category.findById(id); // Sử dụng model Category
            if (!category) {
                resolve({
                    status: 'ERR',
                    message: 'Category not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Category fetched successfully',
                    data: category
                });
            }
        } catch (error) {
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategorys,
    getCategoryByID
};
