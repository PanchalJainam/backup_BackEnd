const express = require("express");
const router = express.Router();
const { getRequest, deleteRequest } = require("../controllers/request.js");

router.get("/", getRequest);
router.delete("/:id", deleteRequest);
module.exports = router;
