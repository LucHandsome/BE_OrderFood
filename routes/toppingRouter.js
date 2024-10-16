const express = require('express');
const router = express.Router();
const ToppingController = require('../controller/topping.js');

router.post('/add-topping', ToppingController.createTopping);
router.put('/update-topping/:id', ToppingController.updateTopping);
router.delete('/delete-topping/:id', ToppingController.deleteTopping);
router.get('/get-all-toppings', ToppingController.getAllToppings);
router.get('/get-topping-by-group/:categoryID', ToppingController.getToppingBycategoryID);
router.get('/get-toppings-by-store/:storeId', ToppingController.getToppingsByStore);


module.exports = router;
