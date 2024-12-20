const mongoose = require('mongoose');

const connectWalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    signature: {type: String, required: true}
});

const connectWallet = mongoose.model('connectWallet', connectWalletSchema);

module.exports = connectWallet;
