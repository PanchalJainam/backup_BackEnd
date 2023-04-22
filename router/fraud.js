const express = require('express');
const router = express.Router();
const { addFraud, deleteReport, getFrauds, deleteFraud } = require('../controllers/fraud.js');

router.get('/', getFrauds);
router.post('/', addFraud);
router.delete('/:id', deleteReport)
router.delete('/remove/:id', deleteFraud)


module.exports = router;