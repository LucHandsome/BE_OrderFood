const express = require("express");
const router = express.Router();

const productController = require('../controller/ProductController.js');



router.post('/create-product', productController.createProduct);
router.put('/update-product/:id', productController.updateProduct);
router.get('/getall-products', productController.getAllProduct);
router.delete('/delete-product/:id', productController.deleteProduct);

module.exports = router;
