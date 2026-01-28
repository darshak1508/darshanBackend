const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pricing = sequelize.define('Pricing', {
    PricingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'PricingID'
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
    RoTonPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'RoTonPrice'
    },
    OpenTonPrice: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      field: 'OpenTonPrice'
    },
    EffectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'EffectiveDate'
    }
  }, {
    tableName: 'Pricing',
    timestamps: false
  });

  return Pricing;
}; 