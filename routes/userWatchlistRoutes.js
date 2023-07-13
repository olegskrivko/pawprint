const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userWatchlistController = require('../controllers/userWatchlistController');

const { isLoggedIn, /*isAuthor,*/ languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, catchAsync(userWatchlistController.renderUserWatchlist)).put(isLoggedIn, catchAsync(userWatchlistController.updateUserWatchlist));
router.route('/all').delete(isLoggedIn, catchAsync(userWatchlistController.deleteAllUserWatchlist));
router.route('/:petId').delete(isLoggedIn, catchAsync(userWatchlistController.deleteUserWatchlist));

module.exports = router;
