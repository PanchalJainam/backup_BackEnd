const express = require('express');
const router = express.Router();
const { getNgo, deleteNgo } = require('../controllers/ngo');

router.get('/', getNgo);
router.delete('/:id', deleteNgo);


module.exports = router;