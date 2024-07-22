const express = require("express");
const router = express.Router();
const StoreController = require('../controller/StoreController.js')


router.post('/sign-up-store', StoreController.createStore);
router.get('/getstore/:id', StoreController.getStore);
router.get('/getall-stores', StoreController.getAllStores);


module.exports = router;
