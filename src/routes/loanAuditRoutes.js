const express = require('express');
const router = express.Router();
const loanAuditController = require('../controllers/loanAuditController');

// Create or update a loan audit profile
router.post('/', loanAuditController.saveLoanAudit);

// Get all loan audit profiles
router.get('/', loanAuditController.getLoanAudits);

// Manually run EMI reminder job (sends actual reminder emails for loans due in 3 days)
router.post('/reminder/run', loanAuditController.runReminderJob);

// Get a single loan audit profile
router.get('/:id', loanAuditController.getLoanAudit);

// Delete a loan audit profile
router.delete('/:id', loanAuditController.deleteLoanAudit);

module.exports = router;
