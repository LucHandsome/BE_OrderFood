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
            Store_timeClose
        } = newStore;

        try {
            // Check if a store with the same name already exists
            const checkStore = await Store.findOne({
                Store_name: Store_name
            });
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
                Store_timeClose
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
            const store = await Store.findById(storeId);
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
const getAllStores = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm tất cả các cửa hàng
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
    getAllStores
};

