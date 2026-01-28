const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    VehicleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'VehicleID'
    },
    VehicleNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'VehicleNo'
    },
    DriverNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'DriverNumber'
    },
    OwnerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'OwnerName'
    },
    FirmID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'FirmID',
      references: {
        model: 'Firms',
        key: 'FirmID'
      }
    }
  }, {
    tableName: 'Vehicles',
    timestamps: false
  });

  return Vehicle;
}; 