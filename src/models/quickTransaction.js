const mongoose = require('mongoose');

const quickTransactionSchema = new mongoose.Schema({
  QuickTransactionID: {
    type: Number,
    unique: true
  },
  // Optional Vehicle/Driver Info (not linked to any table)
  VehicleNo: {
    type: String,
    default: null
  },
  DriverName: {
    type: String,
    default: null
  },
  DriverNumber: {
    type: String,
    default: null
  },
  // Tonnage
  RoTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  OpenTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  TotalTon: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  // Prices (directly passed by user)
  RoTonPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  OpenTonPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  // Calculated Amounts
  RoAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  OpenAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  TotalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v) => parseFloat(v.toString())
  },
  // Payment Mode
  CashAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: (v) => parseFloat(v.toString())
  },
  OnlineAmount: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0,
    get: (v) => parseFloat(v.toString())
  },
  OnlinePaymentDetails: {
    type: String,
    default: null
  },
  // Transaction Date
  TransactionDate: {
    type: Date,
    required: true
  },
  // Optional Remarks
  Remarks: {
    type: String,
    default: null
  }
}, {
  collection: 'QuickTransactions',
  timestamps: false,
  versionKey: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Auto-increment QuickTransactionID
quickTransactionSchema.pre('save', async function (next) {
  if (!this.QuickTransactionID) {
    const lastTransaction = await this.constructor.findOne({}, {}, { sort: { 'QuickTransactionID': -1 } });
    this.QuickTransactionID = lastTransaction ? lastTransaction.QuickTransactionID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('QuickTransaction', quickTransactionSchema);
