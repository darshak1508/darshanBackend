const { Note } = require('../models');

const noteController = {
    // Create a new note
    createNote: async (req, res) => {
        try {
            const { Title, Content } = req.body;
            const UserID = req.user.UserID; // From authMiddleware

            if (!Title || !Content) {
                return res.status(400).json({ message: "Title and Content are required." });
            }

            const note = new Note({
                UserID,
                Title,
                Content
            });

            await note.save();
            res.status(201).json(note);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get all notes for the authenticated user
    getNotes: async (req, res) => {
        try {
            const UserID = req.user.UserID;
            const notes = await Note.find({ UserID }).sort({ UpdatedAt: -1 });
            res.json(notes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Get a single note by ID
    getNote: async (req, res) => {
        try {
            const { id } = req.params;
            const UserID = req.user.UserID;

            const note = await Note.findOne({ NoteID: id, UserID });

            if (!note) {
                return res.status(404).json({ message: "Note not found." });
            }

            res.json(note);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Update a note
    updateNote: async (req, res) => {
        try {
            const { id } = req.params;
            const { Title, Content } = req.body;
            const UserID = req.user.UserID;

            const note = await Note.findOneAndUpdate(
                { NoteID: id, UserID },
                {
                    Title,
                    Content,
                    UpdatedAt: Date.now()
                },
                { new: true }
            );

            if (!note) {
                return res.status(404).json({ message: "Note not found." });
            }

            res.json(note);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Delete a note
    deleteNote: async (req, res) => {
        try {
            const { id } = req.params;
            const UserID = req.user.UserID;

            const note = await Note.findOneAndDelete({ NoteID: id, UserID });

            if (!note) {
                return res.status(404).json({ message: "Note not found." });
            }

            res.json({ message: "Note deleted successfully." });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = noteController;
