const express = require("express");
const router = express.Router();

const productController = require('../controller/ProductController.js');



router.post('/create-product', productController.createProduct);
router.put('/update-product/:id', productController.updateProduct);
router.get('/getall-products', productController.getAllProduct);
router.get('/get-product/:id', productController.getProductById);
router.delete('/delete-product/:id', productController.deleteProduct);
router.get('/get-products-by-store/:storeId', productController.getProductsByStore);
router.get('/get-randompro', productController.getRandomProductsController);
router.get('/search', productController.searchProducts);



module.exports = router;
