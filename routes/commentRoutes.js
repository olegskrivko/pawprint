const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');

const comments = require('../controllers/commentsController');
// Import middleware functions
const { validateComment, isLoggedIn, isCommentAuthor } = require('../middleware/middleware');
const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Define routes
router.post(
  '/',
  isLoggedIn, // Middleware to check if user is logged in
  //validateComment, // Middleware to validate comment
  catchAsync(comments.createComment),
);

router.delete(
  '/:commentId',
  isLoggedIn, // Middleware to check if user is logged in
  isCommentAuthor, // Middleware to check if user is the author of the comment
  catchAsync(comments.deleteComment),
);

module.exports = router;
