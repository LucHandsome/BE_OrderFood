const mongoose = require('mongoose');

const TKCHSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        confirmPassword: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

const TKCH = mongoose.model('TKCH', TKCHSchema);
module.exports = TKCH;
