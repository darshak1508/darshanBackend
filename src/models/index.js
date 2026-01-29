const mongoose = require('mongoose');

// Import models
const Firm = require('./firm');
const Pricing = require('./pricing');
const Transaction = require('./transaction');
const Vehicle = require('./vehicle');
const User = require('./user');

// Check for required environment variable
if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI not found in environment variables');
}

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
  User
};