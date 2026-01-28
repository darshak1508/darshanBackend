const { Firm } = require('../models');
const { Op } = require('sequelize');

const firmController = {
  // Get all firms
  getAllFirms: async (req, res) => {
    try {
      const firms = await Firm.findAll();
      res.json(firms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get firm by ID
  getFirm: async (req, res) => {
    try {
      const firm = await Firm.findByPk(req.params.id);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      res.json(firm);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new firm
  createFirm: async (req, res) => {
    try {
      const firm = await Firm.create(req.body);
      res.status(201).json(firm);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update firm
  updateFirm: async (req, res) => {
    try {
      const firm = await Firm.findByPk(req.params.id);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      
      await firm.update(req.body);
      res.json({ message: "Firm updated successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete firm
  deleteFirm: async (req, res) => {
    try {
      const firm = await Firm.findByPk(req.params.id);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      
      await firm.destroy();
      res.json({ message: "Firm deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total firms count
  getTotalFirms: async (req, res) => {
    try {
      const totalFirms = await Firm.count();
      res.json({ totalFirms });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get today's stats
  getTodayStats: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await Transaction.findAll({
        where: {
          TransactionDate: {
            [Op.gte]: today
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('TotalTon')), 'totalTon'],
          [sequelize.fn('SUM', sequelize.col('TotalPrice')), 'totalAmount']
        ]
      });

      res.json({
        totalTon: stats[0].dataValues.totalTon || 0,
        totalAmount: stats[0].dataValues.totalAmount || 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = firmController; 