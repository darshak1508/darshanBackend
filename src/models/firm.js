const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema({
  FirmID: {
    type: Number,
    unique: true
  },
  FirmName: {
    type: String,
    required: true
  },
  ContactPerson: {
    type: String,
    default: null
  },
  Address: {
    type: String,
    default: null
  },
  City: {
    type: String,
    default: null
  },
  PhoneNumber: {
    type: String,
    required: true,
    maxlength: 10
  },
  Email: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  }
}, {
  collection: 'Firms',
  timestamps: false,
  versionKey: false
});

// Auto-increment FirmID
firmSchema.pre('save', async function (next) {
  if (!this.FirmID) {
    const lastFirm = await this.constructor.findOne({}, {}, { sort: { 'FirmID': -1 } });
    this.FirmID = lastFirm ? lastFirm.FirmID + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Firm', firmSchema);