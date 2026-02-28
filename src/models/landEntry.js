const mongoose = require('mongoose');

const landTransactionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true, default: '' }
}, { _id: true, versionKey: false });

const landCreditSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ['cash', 'cheque', 'bank'], default: 'cash' },
    chequeName: { type: String, trim: true },
    chequeNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    bankMode: { type: String, enum: ['rtgs', 'imps', 'neft', ''], default: '' },
    txnNumber: { type: String, trim: true },
    description: { type: String, trim: true, default: '' }
}, { _id: true, versionKey: false });

const constructionExpenseSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, trim: true, default: '' },
    mode: { type: String, enum: ['cash', 'cheque', 'bank'], default: 'cash' },
    chequeName: { type: String, trim: true },
    chequeNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    bankMode: { type: String, enum: ['rtgs', 'imps', 'neft', ''], default: '' },
    txnNumber: { type: String, trim: true }
}, { _id: true, versionKey: false });

const landEntrySchema = new mongoose.Schema({
    EntryID: { type: Number, unique: true },
    UserID: { type: Number, required: true },
    Name: { type: String, trim: true },
    SurveyNumber: { type: String, trim: true },
    Location: { type: String, trim: true },
    RateOfLand: { type: Number },
    TotalLandArea: { type: String, trim: true },
    FP: { type: String, trim: true },
    TP: { type: String, trim: true },
    MyParticipation: { type: Number, min: 0, max: 100 },
    FirmName: { type: String, trim: true },
    LandType: { type: String, enum: ['construction', 'direct_sell'], default: 'direct_sell' },
    SchemeName: { type: String, trim: true },
    Transactions: [landTransactionSchema],
    Credits: [landCreditSchema],
    ConstructionExpenses: [constructionExpenseSchema],
    CreatedAt: { type: Date, default: Date.now },
    UpdatedAt: { type: Date, default: Date.now }
}, { collection: 'LandEntries', versionKey: false });

landEntrySchema.pre('save', async function (next) {
    if (!this.EntryID) {
        const last = await this.constructor.findOne({}, {}, { sort: { 'EntryID': -1 } });
        this.EntryID = last ? last.EntryID + 1 : 1;
    }
    if (!this.isNew) {
        this.UpdatedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('LandEntry', landEntrySchema);
