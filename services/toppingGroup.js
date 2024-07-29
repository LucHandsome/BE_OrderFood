// services/toppingGroupService.js

const ToppingGroup = require('../models/toppingGroup.js');
const mongoose = require('mongoose');

const createToppingGroup = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newToppingGroup = new ToppingGroup(data);
            const savedToppingGroup = await newToppingGroup.save();
            resolve({
                status: 'OK',
                message: 'Topping group created successfully',
                data: savedToppingGroup
            });
        } catch (error) {
            console.error('Error creating topping group:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

const updateToppingGroup = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedToppingGroup = await ToppingGroup.findByIdAndUpdate(id, data, { new: true });
            if (!updatedToppingGroup) {
                resolve({
                    status: 'ERR',
                    message: 'Topping group not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Topping group updated successfully',
                    data: updatedToppingGroup
                });
            }
        } catch (error) {
            reject(error.message);
        }
    });
};

const deleteToppingGroup = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedToppingGroup = await ToppingGroup.findByIdAndDelete(id);
            if (!deletedToppingGroup) {
                resolve({
                    status: 'ERR',
                    message: 'Topping group not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Topping group deleted successfully'
                });
            }
        } catch (error) {
            reject(error.message);
        }
    });
};
const getAllToppingGroups = (store_Id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const toppingGroups = await ToppingGroup.find({ storeId: store_Id });
            resolve({
                status: 'OK',
                message: 'Topping groups fetched successfully',
                data: toppingGroups
            });
        } catch (error) {
            console.error('Error fetching topping groups:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};
const getToppingGroupByID = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra id có phải là định dạng hợp lệ không
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return reject({
                    status: 'ERR',
                    message: 'Invalid ID format'
                });
            }

            const toppingGroup = await ToppingGroup.findById(id);
            if (!toppingGroup) {
                resolve({
                    status: 'ERR',
                    message: 'Topping group not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Topping group fetched successfully',
                    data: toppingGroup
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
    createToppingGroup,
    updateToppingGroup,
    deleteToppingGroup,
    getAllToppingGroups,
    getToppingGroupByID
};
