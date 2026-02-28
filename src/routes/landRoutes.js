const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

router.get('/', landController.getAll);
router.get('/:id', landController.getById);
router.post('/', landController.create);
router.put('/:id', landController.update);
router.delete('/:id', landController.delete);

module.exports = router;
