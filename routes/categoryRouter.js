// routes/CategoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController.js');

router.post('/addCategory/:storeId', categoryController.createCategory);
router.put('/updateCategory/:id', categoryController.updateCategory);
router.delete('/deleteCategory/:id', categoryController.deleteCategory);
router.get('/getallCategory', categoryController.getAllCategories);
router.get('/get-Category-by-id/:id',categoryController.getCategoryByID)

module.exports = router;
