const express = require('express');
const router = express.Router();
const ToppingController = require('../controller/topping.js');

router.post('/add-topping/:toppingGroupID', ToppingController.createTopping);
router.put('/update-topping/:id', ToppingController.updateTopping);
router.delete('/delete-topping/:id', ToppingController.deleteTopping);
router.get('/get-all-toppings', ToppingController.getAllToppings);
router.get('/get-topping-by-group/:toppingGroupID', ToppingController.getToppingByToppingGroupID);

module.exports = router;
