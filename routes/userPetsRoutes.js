const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userPetsController = require('../controllers/userPetsController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(isLoggedIn, catchAsync(userPetsController.renderUserPets));

module.exports = router;
