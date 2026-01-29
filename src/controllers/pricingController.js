const { Pricing, Firm } = require('../models');

const pricingController = {
  // Get all pricing entries
  getAllPricing: async (req, res) => {
    try {
      const pricing = await Pricing.find();
      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get pricing by ID
  getPricingById: async (req, res) => {
    try {
      const pricing = await Pricing.findOne({ PricingID: req.params.id })
        .populate('FirmID', 'FirmName');

      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found" });
      }

      res.json(pricing);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new pricing entry
  createPricing: async (req, res) => {
    try {
      const firmId = req.params.firmId;
      const { RoTonPrice, OpenTonPrice } = req.body;

      // Check if firm exists
      const firm = await Firm.findOne({ FirmID: firmId });
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      // Check if pricing already exists for this firm
      const existingPricing = await Pricing.findOne({ FirmID: firmId });
      if (existingPricing) {
        return res.status(400).json({
          message: "Pricing already exists for this firm. Please update it instead."
        });
      }

      const pricing = new Pricing({
        FirmID: firmId,
        RoTonPrice: Number(RoTonPrice).toFixed(2),
        OpenTonPrice: Number(OpenTonPrice).toFixed(2),
        EffectiveDate: new Date()
      });

      await pricing.save();
      res.status(201).json(pricing);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update pricing
  updatePricing: async (req, res) => {
    try {
      const { RoTonPrice, OpenTonPrice } = req.body;
      const firmId = req.params.firmId;

      const pricing = await Pricing.findOneAndUpdate(
        { FirmID: firmId },
        {
          RoTonPrice: Number(RoTonPrice).toFixed(2),
          OpenTonPrice: Number(OpenTonPrice).toFixed(2),
          EffectiveDate: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!pricing) {
        return res.status(404).json({ message: "Pricing record not found for this firm." });
      }

      res.json({ message: "Pricing updated successfully." });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete pricing
  deletePricing: async (req, res) => {
    try {
      const pricing = await Pricing.findOneAndDelete({ PricingID: req.params.id });
      if (!pricing) {
        return res.status(404).json({ message: "Pricing not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = pricingController;