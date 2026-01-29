const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firmController');

// GET all firms
router.get('/', firmController.getAllFirms);

// GET firm by id
router.get('/:id', firmController.getFirm);

// POST new firm
router.post('/', firmController.createFirm);

// PUT update firm
router.put('/:id', firmController.updateFirm);

// DELETE firm
router.delete('/:id', firmController.deleteFirm);

// GET total firms count
router.get('/total', firmController.getTotalFirms);

// GET today's stats
router.get('/today-stats', firmController.getTodayStats);

// Add this new route
router.get('/count/total', firmController.getTotalFirms);

module.exports = router; 