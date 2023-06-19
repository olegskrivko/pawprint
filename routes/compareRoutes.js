const express = require("express");
const router = express.Router();
const compareController = require("../controllers/compareController");
const catchAsync = require("../utils/catchAsync");

// router.get("/", catchAsync(compareController.compares));
router.get("/:id", catchAsync(compareController.compare));

module.exports = router;
