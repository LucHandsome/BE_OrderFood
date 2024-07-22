const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    Topping_id: { type: String, required: true, unique: true },
    Food_id: { type: String, required: true },
    Topping_name: { type: String, required: true },
    Price: { type: Number, required: true },
    Food_picture: { type: String, required: true },
    Store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;