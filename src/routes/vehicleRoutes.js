const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', vehicleController.getAllVehicles);

// Get vehicles by firm
router.get('/byFirm/:firmId', vehicleController.getVehiclesByFirm);

// Get total vehicles by firm
router.get('/count/byFirm/:firmId', vehicleController.getTotalVehiclesByFirm);

// Create vehicle
router.post('/', vehicleController.createVehicle);

// Update vehicle
router.put('/:id', vehicleController.updateVehicle);

// Delete vehicle
router.delete('/:id', vehicleController.deleteVehicle);

// Add these new routes
router.get('/count/total', vehicleController.getTotalVehicles);
router.get('/count/firm/:firmId', vehicleController.getTotalVehiclesByFirm);

module.exports = router; 