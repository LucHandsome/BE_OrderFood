// services/RatingService.js
const Rating = require('../models/Rating');

const createRating = async (ratingData) => {
    const rating = new Rating(ratingData);
    return await rating.save();
};

const getRatingsByOrderId = async (orderId) => {
    return await Rating.find({ orderId }).populate('customerId', 'name');
};
const getRatingsByProductId = async (productId) => {
    try {
        // Find all ratings for the given product and populate customer details
        return await Rating.find({ productId })
            .populate('customerId', 'name avatar') // Get customer name and avatar
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error('Error retrieving ratings');
    }
};

module.exports = {
    createRating,
    getRatingsByOrderId,
    getRatingsByProductId,
};
