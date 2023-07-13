const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userSettingsController = require('../controllers/userSettingsController');
const { isLoggedIn, /*isAuthor,*/ languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, userSettingsController.renderUserSettings).put(isLoggedIn, catchAsync(userSettingsController.updateUserSettings));

module.exports = router;
