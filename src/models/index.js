const { Sequelize } = require('sequelize');
const FirmModel = require('./firm');
const PricingModel = require('./pricing');
const TransactionModel = require('./transaction');
const VehicleModel = require('./vehicle');

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
  throw new Error('Database configuration not found in environment variables');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: true, // Enable logging temporarily for debugging
    port: 3306,
    dialectOptions: {
      ssl: false
    }
  }
);

const Firm = FirmModel(sequelize);
const Pricing = PricingModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Vehicle = VehicleModel(sequelize);

// Define relationships
Firm.hasOne(Pricing, { foreignKey: 'FirmID' });
Pricing.belongsTo(Firm, { foreignKey: 'FirmID' });

Firm.hasMany(Transaction, { foreignKey: 'FirmID' });
Transaction.belongsTo(Firm, { foreignKey: 'FirmID' });

Firm.hasMany(Vehicle, { foreignKey: 'FirmID' });
Vehicle.belongsTo(Firm, { foreignKey: 'FirmID' });

Vehicle.hasMany(Transaction, { foreignKey: 'VehicleID' });
Transaction.belongsTo(Vehicle, { foreignKey: 'VehicleID' });

module.exports = {
  sequelize,
  Firm,
  Pricing,
  Transaction,
  Vehicle
}; 