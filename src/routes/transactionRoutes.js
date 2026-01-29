const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// ============================================
// IMPORTANT: Specific routes MUST come BEFORE
// wildcard routes like /:id
// ============================================

// Get all transactions
router.get('/all', transactionController.getAllTransactions);

// Get transactions by firm
router.get('/by-firm/:firmId', transactionController.getTransactionsByFirm);

// Get weekly total ton
router.get('/total-ton/weekly', transactionController.getWeeklyTotalTon);

// Get daily total ton
router.get('/total-ton/daily', transactionController.getDailyTotalTon);

// Get today's total ton
router.get('/total-ton/today', transactionController.getTodayTotalTon);

// Get weekly truck load count
router.get('/truck-load/weekly', transactionController.getWeeklyTruckLoadCount);

// Download PDF report
router.get('/report/pdf', transactionController.downloadTransactionsPdf);

// Download Excel report
router.get('/report/excel', transactionController.downloadTransactionsExcel);

// Get today's total amount
router.get('/today/total', transactionController.getTodayTotalAmount);

// ============================================
// Wildcard routes MUST come LAST
// ============================================

// Create new transaction
router.post('/', transactionController.createTransaction);

// Get transaction by ID (MUST be after specific routes)
router.get('/:id', transactionController.getTransaction);

// Update transaction
router.put('/:id', transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
