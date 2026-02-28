const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ['cash', 'cheque', 'bank'], default: 'cash' },
    chequeName: String,
    chequeNumber: String,
    bankName: String,
    txnId: String
}, { _id: true, versionKey: false });

const interestEntrySchema = new mongoose.Schema({
    EntryID: {
        type: Number,
        unique: true
    },
    UserID: {
        type: Number,
        required: true
    },
    LenderName: {
        type: String,
        trim: true
    },
    BorrowAmount: {
        type: Number,
        required: true
    },
    MonthlyRate: {
        type: Number,
        required: true
    },
    BorrowDate: {
        type: Date,
        required: true
    },
    CycleDay: {
        type: Number,
        required: true,
        min: 1,
        max: 28
    },
    PaymentMode: {
        type: String,
        enum: ['cash', 'cheque', 'bank'],
        default: 'cash'
    },
    ChequeName: String,
    ChequeNumber: String,
    BankName: String,
    TransactionId: String,
    Repayments: [repaymentSchema],
    PaidMonths: [Number],
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'InterestEntries',
    versionKey: false
});

interestEntrySchema.pre('save', async function (next) {
    if (!this.EntryID) {
        const last = await this.constructor.findOne({}, {}, { sort: { 'EntryID': -1 } });
        this.EntryID = last ? last.EntryID + 1 : 1;
    }
    if (!this.isNew) {
        this.UpdatedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('InterestEntry', interestEntrySchema);
