const mongoose = require('mongoose');

const connectWalletSchema = new mongoose.Schema({
    email : { type: String, required: true },
    signature: {type: String, required: true}
});

const connectWallet = mongoose.model('connectWallet', connectWalletSchema);

module.exports = connectWallet;
