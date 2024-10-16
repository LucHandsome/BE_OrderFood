const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    Store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
