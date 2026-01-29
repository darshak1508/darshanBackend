require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const firmRoutes = require('./routes/firmRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/firm', firmRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/vehicle', vehicleRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Add console.log to debug environment variables
    console.log('Database Config:', {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      host: process.env.DB_HOST
    });

    await sequelize.sync();
    console.log('Database connected successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer(); 