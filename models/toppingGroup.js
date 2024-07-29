const mongoose = require('mongoose');

const toppingGroupSchema = new mongoose.Schema({
    toppingGroupName: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }
});

const ToppingGroup = mongoose.model('ToppingGroup', toppingGroupSchema);

module.exports = ToppingGroup;
