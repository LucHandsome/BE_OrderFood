const express = require("express");
const router = express.Router();
const UserController = require('../controller/UserController');


router.post('/verify-otp', UserController.verifyOtp);
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginWithOtp);
router.post('/logout', UserController.logout);
router.post('/verify-login-otp', UserController.verifyLoginOtp);

module.exports = router;
