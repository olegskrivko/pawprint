const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const petsController = require('../controllers/petsController');
const { isLoggedIn, isAuthor, /*validatePet,*/ languageMiddleware } = require('../middleware/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
router
  .route('/')
  .get(catchAsync(petsController.index)) // Get all pets
  .post(isLoggedIn, upload.array('image'), /*validatePet,*/ catchAsync(petsController.createPet)); // Create a new pet

// Routes for report forms
router.get('/new', isLoggedIn, petsController.renderNewForm); // Render new pet report form

// Routes for individual pets
router
  .route('/:id')
  .get(catchAsync(petsController.showPet)) // Get a specific pet
  .put(isLoggedIn, isAuthor, upload.array('image'), /*validatePet, */ catchAsync(petsController.updatePet)) // Update a pet
  .delete(isLoggedIn, isAuthor, catchAsync(petsController.deletePet)); // Delete a pet

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(petsController.renderEditForm)); // Render edit pet form
router.get('/:id/downloadpdf', isLoggedIn, catchAsync(petsController.renderPdf)); // Render pet PDF download

module.exports = router;
