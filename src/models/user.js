const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    UserID: {
        type: Number,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'Users',
    timestamps: false,
    versionKey: false
});

// Auto-increment UserID
userSchema.pre('save', async function (next) {
    if (!this.UserID) {
        const lastUser = await this.constructor.findOne({}, {}, { sort: { 'UserID': -1 } });
        this.UserID = lastUser ? lastUser.UserID + 1 : 1;
    }

    // Hash password before saving (only if password is modified)
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
