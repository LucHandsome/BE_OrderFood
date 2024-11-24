const mongoose = require('mongoose');

const connectWalletSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    email : { type: String, required: true },
    signature: {type: String, required: true}
});

const connectWallet = mongoose.model('connectWallet', connectWalletSchema);

module.exports = connectWallet;
