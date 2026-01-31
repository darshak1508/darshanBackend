const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// All routes are protected by authMiddleware in index.js

// Create a new note
router.post('/', noteController.createNote);

// Get all notes for the user
router.get('/', noteController.getNotes);

// Get a single note by ID
router.get('/:id', noteController.getNote);

// Update a note
router.put('/:id', noteController.updateNote);

// Delete a note
router.delete('/:id', noteController.deleteNote);

module.exports = router;
