// routes/CategoryRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController.js');

const authMiddleware = require('../middleware/auth.js');
router.post('/add-to-cart',cartController.addProductToCart);
router.get('/get-cart',cartController.getCart);
router.put('/update-quantity', cartController.updateCartQuantity);
router.delete('/remove-item', cartController.removeCartItem);

module.exports = router;
