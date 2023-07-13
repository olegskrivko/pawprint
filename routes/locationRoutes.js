const express = require('express');
const router = express.Router({ mergeParams: true });
const locationsController = require('../controllers/locationsController');
const catchAsync = require('../utils/catchAsync');

// Routes
router.get('/:regionName', catchAsync(locationsController.getRegion));

// Create region route - POST /locations Dont need for Prod
router.post('/', catchAsync(locationsController.createRegion));

module.exports = router;
