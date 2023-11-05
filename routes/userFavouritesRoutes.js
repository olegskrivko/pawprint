const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userFavoritesController = require('../controllers/userFavoritesController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(isLoggedIn, catchAsync(userFavoritesController.renderUserFavorites)).put(isLoggedIn, catchAsync(userFavoritesController.updateUserFavorites));
router.route('/:favoriteId').delete(isLoggedIn, catchAsync(userFavoritesController.deleteUserFavorites));

module.exports = router;
