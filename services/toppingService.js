const Topping = require('../models/topping.js');
const Category = require('../models/category.js'); // Đảm bảo model này được import chính xác
const Store = require("../models/Store.js");

// Tạo topping
const createTopping = (newTopping) => {
    return new Promise(async (resolve, reject) => {
        const {
            toppingName,
            toppingPrice,
            toppingImage,
            toppingstatus,
            Store_id,
            categoryID,  // Newly added field
        } = newTopping;

        try {
            // Check if the store exists
            const store = await Store.findById(Store_id);
            if (!store) {
                return resolve({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            // Create a new Topping
            const createdTopping = await Topping.create({
                toppingName,
                toppingPrice,
                toppingImage,
                toppingstatus,
                Store_id,
                categoryID,  // Save the category ID
            });

            if (createdTopping) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdTopping
                });
            }

        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

// Cập nhật topping
const updateTopping = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm topping dựa trên ID
            const topping = await Topping.findById(id);
            if (!topping) {
                return resolve({
                    status: 'ERR',
                    message: 'Topping not found'
                });
            }

            // Kiểm tra nếu categoryID thay đổi
            if (data.categoryID) {
                const category = await Category.findById(data.categoryID);
                if (!category) {
                    return resolve({
                        status: 'ERR',
                        message: 'Category not found'
                    });
                }
            }

            // Cập nhật các trường của topping
            Object.keys(data).forEach(key => {
                topping[key] = data[key];
            });

            const updatedTopping = await topping.save();
            resolve({
                status: 'OK',
                message: 'Topping updated successfully',
                data: updatedTopping
            });
        } catch (error) {
            console.error('Error updating topping:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Xóa topping
const deleteTopping = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedTopping = await Topping.findByIdAndDelete(id);
            if (!deletedTopping) {
                return resolve({
                    status: 'ERR',
                    message: 'Topping not found'
                });
            }

            resolve({
                status: 'OK',
                message: 'Topping deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting topping:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Lấy tất cả topping
const getAllToppings = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const toppings = await Topping.find().populate('categoryID').populate('Store_id');  // Nếu muốn populate thêm thông tin category hoặc Store
            resolve({
                status: 'OK',
                message: 'Toppings fetched successfully',
                data: toppings
            });
        } catch (error) {
            console.error('Error fetching toppings:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Lấy tất cả topping theo categoryID
const getToppingBycategoryID = (categoryID) => {
    return new Promise(async (resolve, reject) => {
        try {
            const toppings = await Topping.find({ categoryID }).populate('Store_id');
            if (toppings.length === 0) {
                return resolve({
                    status: 'ERR',
                    message: 'No toppings found for this category'
                });
            }
            resolve({
                status: 'OK',
                message: 'Toppings fetched successfully',
                data: toppings
            });
        } catch (error) {
            console.error('Error fetching toppings by category ID:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};
const getToppingByStore = async (storeId) => {
    try {
        // Find products based on Store_id
        const toppings = await Topping.find({ Store_id: storeId })
            .populate('categoryID', 'categoryName');  // Populating category details

        return {
            status: 'OK',
            message: 'SUCCESS',
            data: toppings
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};


module.exports = {
    createTopping,
    updateTopping,
    deleteTopping,
    getAllToppings,
    getToppingBycategoryID,
    getToppingByStore
};
