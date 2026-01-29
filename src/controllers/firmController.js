const { Firm } = require('../models');

const firmController = {
  // Get all firms
  getAllFirms: async (req, res) => {
    try {
      const firms = await Firm.find();
      res.json(firms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get firm by ID
  getFirm: async (req, res) => {
    try {
      const firm = await Firm.findOne({ FirmID: req.params.id });
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
      const firm = new Firm(req.body);
      await firm.save();
      res.status(201).json(firm);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update firm
  updateFirm: async (req, res) => {
    try {
      const firm = await Firm.findOneAndUpdate(
        { FirmID: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      res.json({ message: "Firm updated successfully", firm });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete firm
  deleteFirm: async (req, res) => {
    try {
      const firm = await Firm.findOneAndDelete({ FirmID: req.params.id });
      if (!firm) {
        return res.status(404).json({ message: "Firm not found" });
      }
      res.json({ message: "Firm deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total firms count
  getTotalFirms: async (req, res) => {
    try {
      const totalFirms = await Firm.countDocuments();
      res.json({ totalFirms });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get today's stats
  getTodayStats: async (req, res) => {
    try {
      const { Transaction } = require('../models');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await Transaction.aggregate([
        {
          $match: {
            TransactionDate: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalTon: { $sum: { $toDouble: "$TotalTon" } },
            totalAmount: { $sum: { $toDouble: "$TotalPrice" } }
          }
        }
      ]);

      res.json({
        totalTon: stats.length > 0 ? stats[0].totalTon : 0,
        totalAmount: stats.length > 0 ? stats[0].totalAmount : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = firmController;