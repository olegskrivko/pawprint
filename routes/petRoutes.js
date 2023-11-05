const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const petsController = require('../controllers/petsController');
const { isLoggedIn, isAuthor, languageMiddleware } = require('../middleware/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(catchAsync(petsController.index)).post(isLoggedIn, upload.array('image'), catchAsync(petsController.createPet));
router.get('/new', isLoggedIn, petsController.renderNewForm);
router.route('/:id').get(catchAsync(petsController.showPet)).put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(petsController.updatePet)).delete(isLoggedIn, isAuthor, catchAsync(petsController.deletePet));
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(petsController.renderEditForm));
router.get('/:id/downloadpdf', isLoggedIn, catchAsync(petsController.renderPdf));
router.post('/:id/reportpost', isLoggedIn, catchAsync(petsController.reportpost));

module.exports = router;
