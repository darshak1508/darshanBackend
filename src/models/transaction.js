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
  toJSON: { getters: true },
  toObject: { getters: true }
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