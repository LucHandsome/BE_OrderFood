// routes/toppingGroupRoutes.js

const express = require('express');
const router = express.Router();
const ToppingGroupController = require('../controller/toppingGroup.js');

router.post('/addtopping-group/:storeId', ToppingGroupController.createToppingGroup);
router.put('/updatetopping-group/:id', ToppingGroupController.updateToppingGroup);
router.delete('/deletetopping-group/:id', ToppingGroupController.deleteToppingGroup);
router.get('/getalltopping-group/:storeId', ToppingGroupController.getAllToppingGroups);
router.get('/get-toppingGroup-by-id/:id',ToppingGroupController.getToppingGroupByID)

module.exports = router;
