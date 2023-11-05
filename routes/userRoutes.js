const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const usersController = require('../controllers/usersController');
const { isLoggedIn, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/register').get(usersController.renderRegister).post(catchAsync(usersController.register));
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
router.get('/logout', usersController.logout);
router.get('/verify/:token', usersController.verifyEmail);
router.get('/verificationlink', isLoggedIn, usersController.emailVerificationLink);

module.exports = router;
