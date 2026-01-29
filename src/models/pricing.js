const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  PricingID: {
    type: Number,
    unique: true
  },
  FirmID: {
    type: Number,
    required: true
  },
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
  EffectiveDate: {
    type: Date,
    required: true
  }
}, {
  collection: 'Pricing',
  timestamps: false,
  versionKey: false,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Auto-increment PricingID
pricingSchema.pre('save', async function (next) {
  if (!this.PricingID) {
    const lastPricing = await this.constructor.findOne({}, {}, { sort: { 'PricingID': -1 } });
    this.PricingID = lastPricing ? lastPricing.PricingID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Pricing', pricingSchema);