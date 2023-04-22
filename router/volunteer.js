const express = require('express');
const { getVolunteer, deleteVolunteer } = require('../controllers/volunteer');
const router = express.Router();

router.get('/', getVolunteer);
router.delete('/:id', deleteVolunteer);


module.exports = router;