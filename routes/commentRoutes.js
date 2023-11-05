const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const comments = require('../controllers/commentsController');
const { isLoggedIn, isCommentAuthor } = require('../middleware/middleware');
const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.post('/', isLoggedIn, catchAsync(comments.createComment));
router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(comments.deleteComment));

module.exports = router;
