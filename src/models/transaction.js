const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  TransactionID: {
    type: Number,
    unique: true
  },
  FirmID: {
    type: Number,
    required: true
  },
  VehicleID: {
    type: Number,
    required: true
  },
  RoNumber: {
    type: String,
    required: true
  },
  RoTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  TotalTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  OpenTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  RoPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  OpenPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  TotalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  TransactionDate: {
    type: Date,
    required: true
  }
}, {
  collection: 'Transactions',
  timestamps: false,
  versionKey: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Virtual populate for Vehicle
transactionSchema.virtual('Vehicle', {
  ref: 'Vehicle',
  localField: 'VehicleID',
  foreignField: 'VehicleID',
  justOne: true
});

// Virtual populate for Firm
transactionSchema.virtual('Firm', {
  ref: 'Firm',
  localField: 'FirmID',
  foreignField: 'FirmID',
  justOne: true
});

// Auto-increment TransactionID
transactionSchema.pre('save', async function (next) {
  if (!this.TransactionID) {
    const lastTransaction = await this.constructor.findOne({}, {}, { sort: { 'TransactionID': -1 } });
    this.TransactionID = lastTransaction ? lastTransaction.TransactionID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);