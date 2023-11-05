const { petSchema, commentSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require('../models/user.js'); // Assuming your user model is defined in '../models/user.js'
const Pet = require('../models/pet.js');
const Comment = require('../models/comment.js');
const i18n = require('i18n');

// Middleware function to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in');
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware function to check if the user is the author of the pet
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const pet = await Pet.findById(id);
  if (!pet.author.equals(req.user._id)) {
    req.flash('error', "You don't have permission to do that!");
    return res.redirect(`/pets/${pet._id}`);
  }
  next();
};

// Middleware function to check if the user is the author of the comment
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment.author.equals(req.user._id)) {
    req.flash('error', "You don't have permission to do that!");
    return res.redirect(`/pets/${pet._id}`);
  }
  next();
};

module.exports.languageMiddleware = (req, res, next) => {
  i18n.init(req, res, async () => {
    // console.log('req', req);
    try {
      let userLanguage;

      if (req.isAuthenticated()) {
        // User is logged in, retrieve language preference from user profile
        const user = await User.findById(req.user.id);
        userLanguage = user.language;
        //console.log('User language from DB: ', userLanguage);
        res.locals.userLanguage = userLanguage;
      } else {
        // User is not logged in, retrieve language preference from request headers
        userLanguage = req.headers['accept-language'];
        // Determine user's preferred language
        const primaryLanguage = userLanguage.split(',')[0].split('-')[0];
        //console.log('User language from headers: ', primaryLanguage);
        // Set the determined language as a variable accessible in your routes
        res.locals.userLanguage = primaryLanguage;
      }

      // Set the locale for i18n module based on user's language preference
      req.setLocale(userLanguage);

      // Continue to the next middleware
      next();
    } catch (err) {
      console.error(err.message);
      // Handle the error or redirect to an appropriate error page
      res.redirect('/error');
    }
  });
};
