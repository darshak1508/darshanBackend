const express = require('express');
const router = express.Router();
const quickTransactionController = require('../controllers/quickTransactionController');

// ============================================
// IMPORTANT: Specific routes MUST come BEFORE
// wildcard routes like /:id
// ============================================

// Get all quick transactions
router.get('/all', quickTransactionController.getAllQuickTransactions);

// Get today's totals
router.get('/totals/today', quickTransactionController.getTodayTotals);

// Get weekly totals
router.get('/totals/weekly', quickTransactionController.getWeeklyTotals);

// Get payment summary (cash vs online breakdown)
router.get('/payment-summary', quickTransactionController.getPaymentSummary);

// Download PDF report
router.get('/report/pdf', quickTransactionController.downloadQuickTransactionsPdf);

// Download Excel report
router.get('/report/excel', quickTransactionController.downloadQuickTransactionsExcel);

// ============================================
// Wildcard routes MUST come LAST
// ============================================

// Create new quick transaction
router.post('/', quickTransactionController.createQuickTransaction);

// Get quick transaction by ID (MUST be after specific routes)
router.get('/:id', quickTransactionController.getQuickTransaction);

// Update quick transaction
router.put('/:id', quickTransactionController.updateQuickTransaction);

// Delete quick transaction
router.delete('/:id', quickTransactionController.deleteQuickTransaction);

module.exports = router;
