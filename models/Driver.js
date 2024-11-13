const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
    name: { type: String, required: false, unique: true },
    email: { type: String, required: true, unique: true },
    avatar:{type: String,required: false},
    otp: { type: String },
    otpExpire: {type: String},
    driverLicenseNumber: { type: String, required: false},
    vehicleOwnerNumber:{ type: String, required: false},
    gender: { type: String,
            enum: ['Nam', 'Nữ'],
            required: false },
    dateOfBirth: { type: Date, required: false},

}, {
    timestamps: true
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
