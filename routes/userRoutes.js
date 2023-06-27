const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const usersController = require('../controllers/usersController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

const multer = require('multer');
const { userAvatarStorage } = require('../cloudinary');
const upload = multer({ storage: userAvatarStorage });

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Register Route
router.route('/register').get(usersController.renderRegister).post(catchAsync(usersController.register));

// Login Route
router
  .route('/login')
  .get(usersController.renderLogin)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    usersController.login,
  );

// Logout Route
router.get('/logout', usersController.logout);

// Define the user routes
router.get('/verify/:token', usersController.verifyEmail);

// Account Routes
router.route('/account/profile').get(isLoggedIn, usersController.renderAccountProfile).put(isLoggedIn, usersController.updateAccount).delete(isLoggedIn, usersController.deleteAccount);

router.route('/account/settings').get(isLoggedIn, usersController.renderAccountSettings).put(isLoggedIn, usersController.updateAccountSettings);

router.route('/account/watchlist').get(isLoggedIn, usersController.renderAccountWatchlist).put(isLoggedIn, usersController.updateAccountWatchlist);

// post or put? catchasync need
router.route('/account/profile/avatar').put(isLoggedIn, upload.single('avatar'), usersController.updateProfileAvatar);

router.route('/account/watchlist/all').delete(isLoggedIn, usersController.deleteAllAccountWatchlist);
router.route('/account/watchlist/:petId').delete(isLoggedIn, usersController.deleteAccountWatchlist);
// Route to delete all watchlist items

module.exports = router;
