const express = require('express');
const router = express.Router();
const driverController = require('../controller/DriverController');

router.post('/signup', driverController.signUp);
router.post('/signin', driverController.signIn);
router.put('/update-driver/:id', driverController.updateDriver);
router.get('/get-driver/:id', driverController.getDriverById);

module.exports = router;
