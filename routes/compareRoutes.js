const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const catchAsync = require('../utils/catchAsync');

const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// router.get("/", catchAsync(compareController.compares));
router.get('/:id', catchAsync(compareController.compare));

module.exports = router;
