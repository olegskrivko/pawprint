const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const usersController = require("../controllers/usersController");
const { isLoggedIn } = require("../middleware/middleware");

const multer = require("multer");
const { userAvatarStorage } = require("../cloudinary");
const upload = multer({ storage: userAvatarStorage });

// Register Route
router
  .route("/register")
  .get(usersController.renderRegister)
  .post(catchAsync(usersController.register));

// Login Route
router
  .route("/login")
  .get(usersController.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    usersController.login
  );

// Logout Route
router.get("/logout", usersController.logout);

// Account Routes
router
  .route("/account/profile")
  .get(isLoggedIn, usersController.renderAccountProfile)
  .put(isLoggedIn, usersController.updateAccount)
  .delete(isLoggedIn, usersController.deleteAccount);

router
  .route("/account/settings")
  .get(isLoggedIn, usersController.renderAccountSettings)
  .put(isLoggedIn, usersController.updateAccountSettings);

router
  .route("/account/watchlist")
  .get(isLoggedIn, usersController.renderAccountWatchlist)
  .put(isLoggedIn, usersController.updateAccountWatchlist);

// post or put? catchasync need
router
  .route("/account/profile/avatar")
  .put(
    isLoggedIn,
    upload.single("avatar"),
    usersController.updateProfileAvatar
  );

router
  .route("/account/watchlist/:petId")
  .delete(isLoggedIn, usersController.deleteAccountWatchlist);

module.exports = router;
