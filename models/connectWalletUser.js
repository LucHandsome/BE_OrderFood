const mongoose = require('mongoose');

const connectWalletUserSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    signature: {type: String, required: true}
});

const connectWalletUser = mongoose.model('connectWalletUser', connectWalletUserSchema);

module.exports = connectWalletUser;
