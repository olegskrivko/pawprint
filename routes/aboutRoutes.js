const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');

const aboutController = require('../controllers/aboutController');
const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(catchAsync(aboutController.index));
router.route('/support').get(catchAsync(aboutController.support));
router.route('/feedback').get(catchAsync(aboutController.feedback));

module.exports = router;
