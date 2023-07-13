const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const passport = require('passport');
const usersController = require('../controllers/usersController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

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
      failureRedirect: '/auth/login',
    }),
    usersController.login,
  );

// Logout Route
router.get('/logout', usersController.logout);

// Define the user routes
router.get('/verify/:token', usersController.verifyEmail);
// added isLoggedIn
router.get('/verificationlink', isLoggedIn, usersController.emailVerificationLink);

module.exports = router;
