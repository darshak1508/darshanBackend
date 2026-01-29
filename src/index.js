require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const firmRoutes = require('./routes/firmRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/firm', authMiddleware, firmRoutes);
app.use('/api/pricing', authMiddleware, pricingRoutes);
app.use('/api/transaction', authMiddleware, transactionRoutes);
app.use('/api/vehicle', authMiddleware, vehicleRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

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