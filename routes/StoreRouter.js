const express = require("express");
const router = express.Router();
const StoreController = require('../controller/StoreController.js');

router.post('/sign-up-store', StoreController.createStore); // Không cần xác thực
router.get('/get-store/:id', StoreController.getStore); // Không yêu cầu xác thực
router.get('/getall-stores/:id', StoreController.getAllStores); 
router.put('/update-store/:id', StoreController.updateStore);
router.get('/stores', StoreController.getAllStoresToLoad);

module.exports = router;
