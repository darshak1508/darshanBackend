const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

// Get all pricing entries
router.get('/', pricingController.getAllPricing);

// Get pricing by ID
router.get('/:id', pricingController.getPricingById);

// Create new pricing
router.post('/:firmId', pricingController.createPricing);

// Update pricing
router.put('/:firmId', pricingController.updatePricing);

// Delete pricing
router.delete('/:id', pricingController.deletePricing);

module.exports = router; 