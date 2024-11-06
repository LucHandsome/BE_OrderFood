const ProductService = require('../services/ProductService');
const mongoose = require('mongoose');

const createProduct = async (req, res) => {
    try {
        const {
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id,
            categoryID,   // Added categoryID field
            Food_status   // Added Food_status field, default to 'Hết'
        } = req.body;

        // Check for missing required fields
        if (!Food_name || !Food_detail || !Price || !Food_picture || !Store_id || !categoryID) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Missing required fields: Food_name, Food_detail, Price, Food_picture, Store_id, categoryID'
            });
        }

        // Call the service to create a new product
        const result = await ProductService.createProduct({
            Food_name,
            Food_detail,
            Price,
            Food_picture,
            Store_id,
            categoryID,  // Pass categoryID to service
            Food_status  // Pass Food_status to service
        });

        return res.status(201).json(result); // Return 201 for resource creation
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;

        // Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid product ID'
            });
        }

        // Call the service to update the product
        const result = await ProductService.updateProduct(id, updatedFields);

        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if product not found
        }

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getAllProduct = async (req, res) => {
    try {
        const result = await ProductService.getAllProduct();
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid product ID'
            });
        }

        const result = await ProductService.deleteProduct(id);

        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if product not found
        }

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getProductsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        // Validate store ID format
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid store ID'
            });
        }

        const result = await ProductService.getProductsByStore(storeId);

        if (result.status === 'ERR') {
            return res.status(404).json(result); // Return 404 if store or products not found
        }

        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        // Validate product ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Invalid product ID'
            });
        }
        // Call the service to get the product by ID
        const product = await ProductService.getProductById(id);
        console.log(product)

        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            status: 'OK',
            data: product
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

const getRandomProductsController = async (req, res) => {
    try {
        const response = await ProductService.getRandomProducts();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    getAllProduct,
    deleteProduct,
    getProductsByStore,
    getProductById,
    getRandomProductsController
};
