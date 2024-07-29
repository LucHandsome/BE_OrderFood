const Topping = require('../models/topping.js');
const ToppingGroup = require('../models/toppingGroup.js'); // Đảm bảo model này được import chính xác

// Tạo topping
const createTopping = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Creating topping with data:', data); // Thêm thông tin log

            const toppingGroup = await ToppingGroup.findOne({ toppingGroupName: data.type });
            if (!toppingGroup) {
                console.log('Topping group not found:', data.type); // Thêm thông tin log
                return reject({
                    status: 'ERR',
                    message: 'Topping group not found for this type'
                });
            }

            data.toppingGroupID = toppingGroup._id;

            const newTopping = new Topping(data);
            const savedTopping = await newTopping.save();
            resolve({
                status: 'OK',
                message: 'Topping created successfully',
                data: savedTopping
            });
        } catch (error) {
            console.error('Error creating topping:', error);
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};


// Cập nhật topping
const updateTopping = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedTopping = await Topping.findByIdAndUpdate(id, data, { new: true });
            if (!updatedTopping) {
                resolve({
                    status: 'ERR',
                    message: 'Topping not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Topping updated successfully',
                    data: updatedTopping
                });
            }
        } catch (error) {
            console.error('Error updating topping:', error); // Thêm thông tin log
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
                resolve({
                    status: 'ERR',
                    message: 'Topping not found'
                });
            } else {
                resolve({
                    status: 'OK',
                    message: 'Topping deleted successfully'
                });
            }
        } catch (error) {
            console.error('Error deleting topping:', error); // Thêm thông tin log
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
            const toppings = await Topping.find();
            resolve({
                status: 'OK',
                message: 'Toppings fetched successfully',
                data: toppings
            });
        } catch (error) {
            console.error('Error fetching toppings:', error); // Thêm thông tin log
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};

// Lấy tất cả topping theo toppingGroupID
const getToppingByToppingGroupID = (toppingGroupID) => {
    return new Promise(async (resolve, reject) => {
        try {
            const toppings = await Topping.find({ toppingGroupID });
            console.log('Toppings found:', toppings);
            resolve({
                status: 'OK',
                message: 'Toppings fetched successfully',
                data: toppings
            });
        } catch (error) {
            console.error('Error fetching toppings by group ID:', error); // Thêm thông tin log
            reject({
                status: 'ERR',
                message: error.message
            });
        }
    });
};


module.exports = {
    createTopping,
    updateTopping,
    deleteTopping,
    getAllToppings,
    getToppingByToppingGroupID
};
