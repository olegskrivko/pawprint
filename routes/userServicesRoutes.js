const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userServicesController = require('../controllers/userServicesController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(isLoggedIn, catchAsync(userServicesController.renderUserServices)).put(isLoggedIn, catchAsync(userServicesController.updateUserServices));
router.route('/:serviceProviderId').delete(isLoggedIn, catchAsync(userServicesController.deleteUserServices));

module.exports = router;
