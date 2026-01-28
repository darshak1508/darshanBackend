const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Firm = sequelize.define('Firm', {
    FirmID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'FirmID'
    },
    FirmName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'FirmName'
    },
    ContactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ContactPerson'
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'Address'
    },
    City: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'City'
    },
    PhoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'PhoneNumber'
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      },
      field: 'Email'
    }
  }, {
    tableName: 'Firms',
    timestamps: false
  });

  return Firm;
}; 