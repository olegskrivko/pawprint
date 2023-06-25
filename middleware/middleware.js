const { petSchema, commentSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError.js');
const User = require('../models/user.js'); // Assuming your user model is defined in '../models/user.js'
const Pet = require('../models/pet.js');
const Comment = require('../models/comment.js');

// Middleware function to check if user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in');
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware function to validate pet data
module.exports.validatePet = (req, res, next) => {
  const { error } = petSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
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

// Middleware function to validate comment data
module.exports.validateComment = (req, res, next) => {
  const { error } = commentSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// module.exports.languageMiddleware = async (req, res, next) => {
//   try {
//     const username = req.session.passport.user;

//     if (username) {
//       const user = await User.findOne({ username });

//       if (user && user.language) {
//         // Set the user's preferred language in the request object
//         req.userLanguage = user.language;
//       }
//     }

//     // Continue to the next middleware or route handler
//     next();
//   } catch (err) {
//     console.error(err.message);
//     // Handle the error or redirect to an appropriate error page
//     res.redirect("/");
//   }
// };

// languageMiddleware.js

// Assuming your user model is defined in '../models/user.js'
const enData = require('../locales/en.json');
const lvData = require('../locales/lv.json');

// Language middleware function
module.exports.languageMiddleware = async (req, res, next) => {
  try {
    let userLanguage;

    if (req.isAuthenticated()) {
      // User is logged in, retrieve language preference from user profile
      const user = await User.findById(req.user.id);
      userLanguage = user.language;
    } else {
      // User is not logged in, retrieve language preference from request headers
      userLanguage = req.headers['accept-language'];
      console.log(userLanguage);
    }

    // Retrieve the corresponding data based on the user's language preference
    const data = userLanguage && userLanguage.startsWith('lv') ? lvData : enData;
    // console.log('data', data);
    // Attach the language data to the request object for access in subsequent middleware or routes
    req.data = data;

    next(); // Call next to proceed to the next middleware or route
  } catch (err) {
    console.error(err.message);
    // Handle the error or redirect to an appropriate error page
    res.redirect('/error');
  }
};
