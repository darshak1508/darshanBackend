const { Vehicle, Firm } = require('../models');

const vehicleController = {
  // Get all vehicles
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.find();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get vehicles by firm
  getVehiclesByFirm: async (req, res) => {
    try {
      const vehicles = await Vehicle.find({ FirmID: req.params.firmId });

      if (!vehicles.length) {
        return res.status(404).json({ message: "No vehicles found for this firm." });
      }

      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total vehicles by firm
  getTotalVehiclesByFirm: async (req, res) => {
    try {
      const { firmId } = req.params;

      // Verify firm exists
      const firm = await Firm.findOne({ FirmID: firmId });
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      const totalVehicles = await Vehicle.countDocuments({ FirmID: firmId });

      res.json({
        firmName: firm.FirmName,
        totalVehicles
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create vehicle
  createVehicle: async (req, res) => {
    try {
      const { FirmId, VehicleNo, DriverNumber, OwnerName } = req.body;

      // Check if firm exists
      const firm = await Firm.findOne({ FirmID: FirmId });
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      // Check if vehicle number already exists for this firm
      const existingVehicle = await Vehicle.findOne({
        FirmID: FirmId,
        VehicleNo: VehicleNo
      });

      if (existingVehicle) {
        return res.status(400).json({
          message: "This vehicle number is already registered with this firm."
        });
      }

      const vehicle = new Vehicle({
        FirmID: FirmId,
        VehicleNo,
        DriverNumber,
        OwnerName
      });

      await vehicle.save();
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update vehicle
  updateVehicle: async (req, res) => {
    try {
      const { FirmId, VehicleNo, DriverNumber, OwnerName } = req.body;

      const vehicle = await Vehicle.findOne({ VehicleID: req.params.id });
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if vehicle number already exists for this firm (excluding current vehicle)
      const existingVehicle = await Vehicle.findOne({
        FirmID: FirmId,
        VehicleNo: VehicleNo,
        VehicleID: { $ne: req.params.id } // Not equal to current vehicle
      });

      if (existingVehicle) {
        return res.status(400).json({
          message: "This vehicle number is already registered with this firm."
        });
      }

      await Vehicle.findOneAndUpdate(
        { VehicleID: req.params.id },
        { FirmID: FirmId, VehicleNo, DriverNumber, OwnerName },
        { new: true, runValidators: true }
      );

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete vehicle
  deleteVehicle: async (req, res) => {
    try {
      const vehicle = await Vehicle.findOneAndDelete({ VehicleID: req.params.id });
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total vehicle count
  getTotalVehicles: async (req, res) => {
    try {
      const totalVehicles = await Vehicle.countDocuments();
      res.json({ totalVehicles });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = vehicleController;