const express = require("express");
const catchAsync = require("../utils/catchAsync");
const locationsController = require("../controllers/locationsController");

const router = express.Router({ mergeParams: true });

// Routes

// Get region route - GET /locations/:regionName
router.get("/:regionName", catchAsync(locationsController.getRegion));

// Create region route - POST /locations
router.post("/", catchAsync(locationsController.createRegion));

module.exports = router;
