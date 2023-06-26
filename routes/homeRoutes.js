const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const catchAsync = require('../utils/catchAsync');
const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.get('/', catchAsync(homeController.renderHome));

module.exports = router;
