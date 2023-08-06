const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userServicesController = require('../controllers/userServicesController');
const { isLoggedIn, /*isAuthor,*/ languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, catchAsync(userServicesController.renderUserServices)).put(isLoggedIn, catchAsync(userServicesController.updateUserServices));
// router.route('/all').delete(isLoggedIn, catchAsync(userServicesController.deleteAllUserServices));
router.route('/:favoriteId').delete(isLoggedIn, catchAsync(userServicesController.deleteUserServices));

module.exports = router;
