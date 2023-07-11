const express = require('express');
const router = express.Router({ mergeParams: true });
// Import your controller files
const userProfileController = require('../controllers/userProfileController');
const passport = require('passport');
const usersController = require('../controllers/usersController');
const multer = require('multer');
const { userAvatarStorage } = require('../cloudinary');
const upload = multer({ storage: userAvatarStorage });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router.route('/').get(isLoggedIn, userProfileController.renderUserProfile).put(isLoggedIn, catchAsync(userProfileController.updateUserProfile)).delete(isLoggedIn, catchAsync(userProfileController.deleteUserProfile));
// post or put? catchasync need
router.route('/avatar').put(isLoggedIn, upload.single('avatar'), catchAsync(userProfileController.updateUserProfileAvatar));

module.exports = router;
