const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  VehicleID: {
    type: Number,
    unique: true
  },
  VehicleNo: {
    type: String,
    required: true,
    maxlength: 50
  },
  DriverNumber: {
    type: String,
    required: true,
    maxlength: 50
  },
  OwnerName: {
    type: String,
    required: true,
    maxlength: 100
  },
  FirmID: {
    type: Number,
    required: true
  }
}, {
  collection: 'Vehicles',
  timestamps: false,
  versionKey: false
});

// Auto-increment VehicleID
vehicleSchema.pre('save', async function (next) {
  if (!this.VehicleID) {
    const lastVehicle = await this.constructor.findOne({}, {}, { sort: { 'VehicleID': -1 } });
    this.VehicleID = lastVehicle ? lastVehicle.VehicleID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);