const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');

router.get('/', interestController.getAll);
router.get('/:id', interestController.getById);
router.post('/', interestController.create);
router.put('/:id', interestController.update);
router.delete('/:id', interestController.delete);

module.exports = router;
