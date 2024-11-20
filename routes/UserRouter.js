const express = require("express");
const router = express.Router();
const UserController = require('../controller/UserController');
const {uploadUserImages} = require('../middleware/upload'); // Multer setup for file uploads


router.post('/verify-otp', UserController.verifyOtp);
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginWithOtp);
router.post('/logout', UserController.logout);
router.post('/verify-login-otp', UserController.verifyLoginOtp);
router.post('/sso/callback', UserController.handleSSOCallback);
router.put('/update/:id',uploadUserImages.single('imageUser'), UserController.updateUserProfile);
router.get('/inforUser/:id', UserController.getUserProfileFromDB);
module.exports = router;
