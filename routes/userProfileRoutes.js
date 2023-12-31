const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const userProfileController = require('../controllers/userProfileController');

const multer = require('multer');
const { userAvatarStorage } = require('../cloudinary');
const upload = multer({ storage: userAvatarStorage });
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(isLoggedIn, userProfileController.renderUserProfile).put(isLoggedIn, catchAsync(userProfileController.updateUserProfile)).delete(isLoggedIn, catchAsync(userProfileController.deleteUserProfile));
router.route('/settings').put(isLoggedIn, catchAsync(userProfileController.updateUserSettings));
router.route('/avatar').put(isLoggedIn, upload.single('avatar'), catchAsync(userProfileController.updateUserProfileAvatar));

module.exports = router;
