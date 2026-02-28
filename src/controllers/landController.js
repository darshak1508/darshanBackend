const { LandEntry } = require('../models');

const landController = {
    getAll: async (req, res) => {
        try {
            const entries = await LandEntry.find({ UserID: req.user.UserID })
                .sort({ CreatedAt: -1 });
            res.json(entries);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const entry = await LandEntry.findOne({
                EntryID: req.params.id,
                UserID: req.user.UserID
            });
            if (!entry) {
                return res.status(404).json({ message: 'Land entry not found' });
            }
            res.json(entry);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const entry = new LandEntry({
                ...req.body,
                UserID: req.user.UserID
            });
            await entry.save();
            res.status(201).json(entry);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { UserID, EntryID, ...updateData } = req.body;
            updateData.UpdatedAt = Date.now();

            const entry = await LandEntry.findOneAndUpdate(
                { EntryID: req.params.id, UserID: req.user.UserID },
                updateData,
                { new: true, runValidators: true }
            );
            if (!entry) {
                return res.status(404).json({ message: 'Land entry not found' });
            }
            res.json({ message: 'Land entry updated successfully', entry });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const entry = await LandEntry.findOneAndDelete({
                EntryID: req.params.id,
                UserID: req.user.UserID
            });
            if (!entry) {
                return res.status(404).json({ message: 'Land entry not found' });
            }
            res.json({ message: 'Land entry deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = landController;
