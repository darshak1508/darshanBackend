const { LoanAudit } = require('../models');

const loanAuditController = {
    // Create or Update a loan audit profile
    saveLoanAudit: async (req, res) => {
        try {
            const { ClientName, LoanType, LoanName, Parameters } = req.body;
            const UserID = req.user.UserID;

            if (!ClientName || !LoanType || !LoanName || !Parameters) {
                return res.status(400).json({ message: "All fields are required." });
            }

            // Check if profile with same name exists for this user to update, or create new
            let audit = await LoanAudit.findOne({ ClientName, LoanName, UserID });

            if (audit) {
                audit.LoanType = LoanType;
                audit.Parameters = Parameters;
                audit.UpdatedAt = Date.now();
                await audit.save();
                return res.json(audit);
            }

            audit = new LoanAudit({
                UserID,
                ClientName,
                LoanType,
                LoanName,
                Parameters
            });

            await audit.save();
            res.status(201).json(audit);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get all loan audit profiles for the authenticated user
    getLoanAudits: async (req, res) => {
        try {
            const UserID = req.user.UserID;
            const audits = await LoanAudit.find({ UserID }).sort({ UpdatedAt: -1 });
            res.json(audits);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get a single loan audit by ID
    getLoanAudit: async (req, res) => {
        try {
            const { id } = req.params;
            const UserID = req.user.UserID;

            const audit = await LoanAudit.findOne({ AuditID: id, UserID });

            if (!audit) {
                return res.status(404).json({ message: "Loan Audit profile not found." });
            }

            res.json(audit);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete a loan audit profile
    deleteLoanAudit: async (req, res) => {
        try {
            const { id } = req.params;
            const UserID = req.user.UserID;

            const audit = await LoanAudit.findOneAndDelete({ AuditID: id, UserID });

            if (!audit) {
                return res.status(404).json({ message: "Loan Audit profile not found." });
            }

            res.json({ message: "Loan Audit profile deleted successfully." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = loanAuditController;
