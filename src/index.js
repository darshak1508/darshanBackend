require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { connectDB } = require('./models');
const { runLoanReminderJob } = require('./jobs/loanReminderJob');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const firmRoutes = require('./routes/firmRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const noteRoutes = require('./routes/noteRoutes');
const quickTransactionRoutes = require('./routes/quickTransactionRoutes');
const loanAuditRoutes = require('./routes/loanAuditRoutes');

const app = express();

// CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';

const corsOptions = {
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim()),
  credentials: corsOrigin !== '*', // credentials can't be used with wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/firm', authMiddleware, firmRoutes);
app.use('/api/pricing', authMiddleware, pricingRoutes);
app.use('/api/transaction', authMiddleware, transactionRoutes);
app.use('/api/vehicle', authMiddleware, vehicleRoutes);
app.use('/api/note', authMiddleware, noteRoutes);
app.use('/api/quick-transaction', authMiddleware, quickTransactionRoutes);
app.use('/api/loan-audit', authMiddleware, loanAuditRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Schedule loan EMI reminder (3 days before due) – daily at 8:00 AM
    const cronSchedule = process.env.LOAN_REMINDER_CRON || '0 8 * * *';
    if (cron.validate(cronSchedule)) {
      cron.schedule(cronSchedule, () => {
        runLoanReminderJob().catch(err => console.error('Loan reminder job error:', err));
      });
      console.log('Loan EMI reminder job scheduled (3 days before due date).');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  // For Serverless/Vercel
  connectDB().catch(err => console.error('MongoDB connection error:', err));
}

module.exports = app; 