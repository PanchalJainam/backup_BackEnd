const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.js');

router.get('/', getReports);


module.exports = router;