// controllers/RatingController.js
const RatingService = require('../services/ratingService');
const Rating = require('../models/Rating')

const createRating = async (req, res) => {
    try {
      const { orderId, productId, customerId, rating, comment } = req.body;
      const imageUrls = req.files.map(file => file.path); // Lấy URL của ảnh từ Cloudinary
  
      const ratingData = {
        orderId,
        productId,
        customerId,
        rating,
        comment,
        images: imageUrls, // Lưu URL của ảnh trong database
      };
  
      const newRating = await RatingService.createRating(ratingData);
      res.status(201).json(newRating);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create rating' });
    }
  };

const getRatingsForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const ratings = await RatingService.getRatingsByOrderId(orderId);
        res.status(200).json(ratings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch ratings', error: error.message });
    }
};

const getRatingsForProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const ratings = await RatingService.getRatingsByProductId(productId);
        res.status(200).json(ratings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const respondToRating = async (req, res) => {
    const { ratingId } = req.params;
    const { response } = req.body;

    try {
        const rating = await Rating.findByIdAndUpdate(
            ratingId,
            { response },
            { new: true }
        );

        if (!rating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        res.status(200).json({ message: 'Response added successfully.', rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add response to rating.' });
    }
};

module.exports = {
    createRating,
    getRatingsForOrder,
    getRatingsForProduct,
    respondToRating
};
