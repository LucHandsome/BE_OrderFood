const express = require("express");
const router = express.Router();
const UserController = require('../controller/UserController.js');


router.post('/sign-up', UserController.createUser);
router.post('/sign-in', UserController.loginUser);
router.post('/check-email', UserController.checkEmailExists);

module.exports = router;
