const Product = require("../models/product");
const Store = require("../models/Store.js");
const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const {
            Food_id,
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id
        } = newProduct;

        try {
            // Kiểm tra xem cửa hàng có tồn tại hay không
            const store = await Store.findById(Store_id);
            if (!store) {
                return resolve({
                    status: 'ERR',
                    message: 'Store not found'
                });
            }

            // Tạo sản phẩm mới
            const createdProduct = await Product.create({
                Food_id,
                Food_name,
                Food_detail,
                Price,
                Food_picture,
                Store_id
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
            // Kiểm tra xem sản phẩm có tồn tại hay không
            const product = await Product.findById(productId);
            if (!product) {
                return resolve({
                    status: 'ERR',
                    message: 'Product not found'
                });
            }

            // Kiểm tra xem cửa hàng có tồn tại hay không nếu Store_id được cung cấp
            if (updatedFields.Store_id) {
                const store = await Store.findById(updatedFields.Store_id);
                if (!store) {
                    return resolve({
                        status: 'ERR',
                        message: 'Store not found'
                    });
                }
            }

            // Cập nhật sản phẩm
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
            const products = await Product.find().populate('Store_id', 'Store_name');
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
        // Tìm sản phẩm dựa trên Store_id
        const products = await Product.find({ Store_id: storeId });
        
        // Trả về kết quả với trạng thái và dữ liệu
        return {
            status: 'OK',
            message: 'SUCCESS',
            data: products
        };
    } catch (e) {
        // Xử lý lỗi và trả về thông báo lỗi
        return {
            status: 'ERR',
            message: e.message
        };
    }
};
const getProductById = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(productId);

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
