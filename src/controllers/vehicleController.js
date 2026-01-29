const { Vehicle, Firm } = require('../models');
const { Op } = require('sequelize');

const vehicleController = {
  // Get all vehicles
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.findAll({
        include: [{ model: Firm }]
      });
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get vehicles by firm
  getVehiclesByFirm: async (req, res) => {
    try {
      const vehicles = await Vehicle.findAll({
        where: { FirmID: req.params.firmId }
      });

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
      const firm = await Firm.findByPk(firmId);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      const totalVehicles = await Vehicle.count({
        where: { FirmID: firmId }
      });
      
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
      const firm = await Firm.findByPk(FirmId);
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      // Check if vehicle number already exists for this firm
      const existingVehicle = await Vehicle.findOne({
        where: {
          FirmID: FirmId,
          VehicleNo: VehicleNo
        }
      });

      if (existingVehicle) {
        return res.status(400).json({ 
          message: "This vehicle number is already registered with this firm." 
        });
      }

      const vehicle = await Vehicle.create({
        FirmID: FirmId,
        VehicleNo,
        DriverNumber,
        OwnerName
      });

      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update vehicle
  updateVehicle: async (req, res) => {
    try {
      const { FirmId, VehicleNo, DriverNumber, OwnerName } = req.body;
      
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Check if vehicle number already exists for this firm (excluding current vehicle)
      const existingVehicle = await Vehicle.findOne({
        where: {
          FirmID: FirmId,
          VehicleNo: VehicleNo,
          VehicleID: { [Op.ne]: req.params.id } // Exclude current vehicle
        }
      });

      if (existingVehicle) {
        return res.status(400).json({ 
          message: "This vehicle number is already registered with this firm." 
        });
      }

      await vehicle.update({
        FirmID: FirmId,
        VehicleNo,
        DriverNumber,
        OwnerName
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete vehicle
  deleteVehicle: async (req, res) => {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      await vehicle.destroy();
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get total vehicle count
  getTotalVehicles: async (req, res) => {
    try {
      const totalVehicles = await Vehicle.count();
      res.json({ totalVehicles });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = vehicleController; 