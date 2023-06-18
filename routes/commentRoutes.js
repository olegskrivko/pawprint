const express = require("express");

// Import internal modules or utilities
const catchAsync = require("../utils/catchAsync");

// Import middleware functions
const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware/middleware");

// Import commentsController
const comments = require("../controllers/commentsController");

const router = express.Router({ mergeParams: true });

// Define routes
router.post(
  "/",
  isLoggedIn, // Middleware to check if user is logged in
  validateComment, // Middleware to validate comment
  catchAsync(comments.createComment) // Async route handler for creating a comment
);

router.delete(
  "/:commentId",
  isLoggedIn, // Middleware to check if user is logged in
  isCommentAuthor, // Middleware to check if user is the author of the comment
  catchAsync(comments.deleteComment) // Async route handler for deleting a comment
);

module.exports = router;
