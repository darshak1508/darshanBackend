const mongoose = require('mongoose');

const loanAuditSchema = new mongoose.Schema({
    AuditID: {
        type: Number,
        unique: true
    },
    UserID: {
        type: Number,
        required: true
    },
    ClientName: {
        type: String,
        required: true,
        trim: true
    },
    LoanType: {
        type: String,
        required: true,
        enum: ['Home Loan', 'Personal Loan', 'Car Loan', 'Other'],
        default: 'Other'
    },
    LoanName: {
        type: String,
        required: true,
        trim: true
    },
    DeductionBank: {
        type: String,
        required: false,
        trim: true
    },
    Parameters: {
        loan: { type: Number, required: true },
        rate: { type: Number, required: true },
        months: { type: Number, required: true },
        emi: { type: Number, required: true },
        disbDate: { type: Date, required: true },
        emiDate: { type: Date, required: true },
        firstMonthMethod: { type: String, required: true },
        isRoundingOn: { type: Boolean, default: true },
        manualPrincAdj: { type: Number, default: 0 }
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'LoanAudits',
    versionKey: false,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true }
});

// Auto-increment AuditID
loanAuditSchema.pre('save', async function (next) {
    if (!this.AuditID) {
        const lastAudit = await this.constructor.findOne({}, {}, { sort: { 'AuditID': -1 } });
        this.AuditID = lastAudit ? lastAudit.AuditID + 1 : 1;
    }

    if (!this.isNew) {
        this.UpdatedAt = Date.now();
    }

    next();
});

// Virtual populate for User
loanAuditSchema.virtual('User', {
    ref: 'User',
    localField: 'UserID',
    foreignField: 'UserID',
    justOne: true
});

module.exports = mongoose.model('LoanAudit', loanAuditSchema);
