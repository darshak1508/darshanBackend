const mongoose = require('mongoose');

// Import models
const Firm = require('./firm');
const Pricing = require('./pricing');
const Transaction = require('./transaction');
const Vehicle = require('./vehicle');
const User = require('./user');
const Note = require('./note');
const QuickTransaction = require('./quickTransaction');
const LoanAudit = require('./loanAudit');
const OtpSession = require('./otpSession');

// Check for required environment variable
if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI not found in environment variables');
}

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    isConnected = db.connections[0].readyState;
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Do not throw immediately in serverless if you want to retry, 
    // but throwing here is fine as long as the handler catches it.
    throw error;
  }
};

module.exports = {
  connectDB,
  mongoose,
  Firm,
  Pricing,
  Transaction,
  Vehicle,
  User,
  Note,
  QuickTransaction,
  LoanAudit,
  OtpSession
};