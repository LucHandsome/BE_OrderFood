const Store = require("../models/Store.js");

const createStore = (newStore) => {
    return new Promise(async (resolve, reject) => {
        const {
            Store_name,
            Store_address,
            Store_picture,
            Store_status,
            Store_LoaiKD,
            Store_timeOpen,
            Store_timeClose,
            userId
        } = newStore;

        try {
            // Check if a store with the same name already exists
            const checkStore = await Store.findOne({ Store_name });
            if (checkStore !== null) {
                return resolve({
                    status: 'ERR',
                    message: 'The store name is already taken'
                });
            }

            // Create the new store
            const createdStore = await Store.create({
                Store_name,
                Store_address,
                Store_picture,
                Store_status,
                Store_LoaiKD,
                Store_timeOpen,
                Store_timeClose,
                userId
            });
            
            if (createdStore) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdStore
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


const getStore = (storeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const store = await Store.findById(storeId).populate('userId', 'email');
            if (!store) {
                return resolve({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: store
            });
        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};


const getAllStores = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm tất cả các cửa hàng của người dùng
            const stores = await Store.find({ userId }).populate('userId', 'email');
            
            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: stores
            });
        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

const updateStore = (storeId, updateFields) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedStore = await Store.findByIdAndUpdate(storeId, updateFields, { new: true });
            if (!updatedStore) {
                return resolve({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedStore
            });
        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

const getAllStoresToLoad = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Lấy tất cả thông tin cửa hàng
            const stores = await Store.find({});
            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: stores
            });
        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

module.exports = {
    createStore,
    getStore,
    getAllStores,
    updateStore,
    getAllStoresToLoad, // Đảm bảo hàm được export chính xác
};
