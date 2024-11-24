const express = require('express');
const router = express.Router();
const driverController = require('../controller/DriverController');
const {uploadDriverImages} = require('../middleware/upload')

router.post('/signup', driverController.signUp);
router.post('/signin', driverController.signIn);
router.get('/get-driver/:id', driverController.getDriverById);
router.post('/sso/callback-driver', driverController.handleSSOCallbackDriver);
router.get('/getAllDriver', driverController.getAllDrivers);
router.put('/update-driver/:driverId',  uploadDriverImages.fields([  // Dùng fields để tải nhiều tệp
    { name: 'profileImage', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 },
    { name: 'vehicleDocumentImage', maxCount: 1 }
  ]), driverController.updateDriverDetails);

module.exports = router;
