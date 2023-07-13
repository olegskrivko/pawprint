const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userPetsController = require('../controllers/userPetsController');
const { isLoggedIn, /*isAuthor,*/ languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, catchAsync(userPetsController.renderUserPets));
router.route('/all').delete(isLoggedIn, catchAsync(userPetsController.deleteAllUserPets));

module.exports = router;
