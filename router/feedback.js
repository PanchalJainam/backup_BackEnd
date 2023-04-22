const express = require('express');
const router = express.Router();
const { getFeedback } = require('../controllers/feedback.js');

router.get('/', getFeedback);


module.exports = router;