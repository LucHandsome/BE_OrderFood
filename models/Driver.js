const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpire: {type: String},
    driverLicenseNumber: { type: String, required: true},
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, required: true},
    vehicleOwnerNumber:{ type: String, required: true}
}, {
    timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
