const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    TransactionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'TransactionID'
    },
    FirmID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'FirmID',
      references: {
        model: 'Firms',
        key: 'FirmID'
      }
    },
    VehicleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'VehicleID',
      references: {
        model: 'Vehicles',
        key: 'VehicleID'
      }
    },
    RoNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'RoNumber'
    },
    RoTon: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'RoTon',
      get() {
        return Number(this.getDataValue('RoTon'));
      }
    },
    TotalTon: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'TotalTon',
      get() {
        return Number(this.getDataValue('TotalTon'));
      }
    },
    OpenTon: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'OpenTon'
    },
    RoPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'RoPrice'
    },
    OpenPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'OpenPrice'
    },
    TotalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'TotalPrice'
    },
    TransactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'TransactionDate'
    }
  }, {
    tableName: 'Transactions',
    timestamps: false
  });

  return Transaction;
}; 