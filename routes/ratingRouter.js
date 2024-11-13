const express = require("express");
const router = express.Router();

const RatingController = require('../controller/ratingController')
const {upload} = require('../middleware/upload'); // Multer setup for file uploads

// Route to add a rating
router.post('/add',upload.array('images', 3), RatingController.createRating);

// Route to get ratings for a specific order
router.get('/order/:orderId', RatingController.getRatingsForOrder);

router.get('/product/:productId', RatingController.getRatingsForProduct);

router.post('/respond/:ratingId', RatingController.respondToRating);

module.exports = router;
