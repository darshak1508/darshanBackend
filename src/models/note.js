const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    NoteID: {
        type: Number,
        unique: true
    },
    UserID: {
        type: Number,
        required: true
    },
    Title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    Content: {
        type: String,
        required: true
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
    collection: 'Notes',
    timestamps: false, // We handle dates manually or use default
    versionKey: false,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true }
});

// Auto-increment NoteID
noteSchema.pre('save', async function (next) {
    if (!this.NoteID) {
        const lastNote = await this.constructor.findOne({}, {}, { sort: { 'NoteID': -1 } });
        this.NoteID = lastNote ? lastNote.NoteID + 1 : 1;
    }

    // Update UpdatedAt on update
    if (!this.isNew) {
        this.UpdatedAt = Date.now();
    }

    next();
});

// Virtual populate for User
noteSchema.virtual('User', {
    ref: 'User',
    localField: 'UserID',
    foreignField: 'UserID',
    justOne: true
});

module.exports = mongoose.model('Note', noteSchema);
