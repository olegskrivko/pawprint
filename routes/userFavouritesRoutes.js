const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userFavoritesController = require('../controllers/userFavoritesController');
const { isLoggedIn, /*isAuthor,*/ languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, catchAsync(userFavoritesController.renderUserFavorites)).put(isLoggedIn, catchAsync(userFavoritesController.updateUserFavorites));
router.route('/all').delete(isLoggedIn, catchAsync(userFavoritesController.deleteAllUserFavorites));

module.exports = router;
