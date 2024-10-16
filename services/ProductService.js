const Product = require("../models/product");
const Store = require("../models/Store.js");
const Category = require('../models/category');

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const {
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id,
            categoryID,  // Newly added field
            Food_status  // Newly added field, optional since it defaults to 'Hết'
        } = newProduct;

        try {
            // Check if the store exists
            const store = await Store.findById(Store_id);
            if (!store) {
                return resolve({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            // Create a new product
            const createdProduct = await Product.create({
                Food_name,
                Food_detail,
                Price,
                Food_picture,
                Store_id,
                categoryID,  // Save the category ID
                Food_status  // Save the food status (optional)
            });

            if (createdProduct) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdProduct
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

const updateProduct = (productId, updatedFields) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if the product exists
            const product = await Product.findById(productId);
            if (!product) {
                return resolve({
                    status: 'ERR',
                    message: 'Product not found'
                });
            }

            // Check if the store exists if Store_id is provided
            if (updatedFields.Store_id) {
                const store = await Store.findById(updatedFields.Store_id);
                if (!store) {
                    return resolve({
                        status: 'ERR',
                        message: 'Store not found'
                    });
                }
            }

            // Update product fields
            Object.keys(updatedFields).forEach(key => {
                product[key] = updatedFields[key];
            });

            const updatedProduct = await product.save();

            if (updatedProduct) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: updatedProduct
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

const getAllProduct = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const products = await Product.find()
                .populate('Store_id', 'Store_name')
                .populate('categoryID', 'categoryName');  // Populating category details

            if (products) {
                return resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: products
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

const deleteProduct = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findByIdAndDelete(productId);
            if (!product) {
                return resolve({
                    status: 'ERR',
                    message: 'Product not found'
                });
            }

            return resolve({
                status: 'OK',
                message: 'Product deleted successfully'
            });
        } catch (e) {
            return reject({
                status: 'ERR',
                message: e.message
            });
        }
    });
};

const getProductsByStore = async (storeId) => {
    try {
        // Find products based on Store_id
        const products = await Product.find({ Store_id: storeId })
            .populate('categoryID', 'categoryName');  // Populating category details

        return {
            status: 'OK',
            message: 'SUCCESS',
            data: products
        };
    } catch (e) {
        return {
            status: 'ERR',
            message: e.message
        };
    }
};

const getProductById = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(productId)
                .populate('categoryID', 'categoryName');  // Populating category details

            if (product) {
                return resolve(product);
            } else {
                return resolve(null);
            }

        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = {
    createProduct,
    updateProduct,
    getAllProduct,
    deleteProduct,
    getProductsByStore,
    getProductById
};
