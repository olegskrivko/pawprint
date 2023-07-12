const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController');
const catchAsync = require('../utils/catchAsync');
// const { isLoggedIn, isAuthor, validatePet, languageMiddleware } = require('../middleware/middleware');
const { isLoggedIn, isAuthor, languageMiddleware } = require('../middleware/middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

//const { languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes for pets
// Routes for pets
// router
//   .route('/')
//   .get(catchAsync(petsController.index)) // Get all pets
//   .post(isLoggedIn, upload.array('image'), (req, res, next) => {
//     // Add console.log statement to check if the route is hit
//     console.log('POST route for creating a pet is hit');
//     petsController.createPet(req, res, next);
//   });

router
  .route('/')
  .get(catchAsync(petsController.index)) // Get all pets
  .post(isLoggedIn, upload.array('image'), catchAsync(petsController.createPet));
// .post(isLoggedIn, upload.array('image'), validatePet, catchAsync(petsController.createPet)); // Create a new pet

// Routes for report forms
router.get('/new', isLoggedIn, petsController.renderNewForm); // Render new pet report form
//router.get('/report/missing', isLoggedIn, petsController.renderMissingForm); // Render missing pet report form
//router.get('/report/found', isLoggedIn, petsController.renderFoundForm); // Render found pet report form

// Routes for individual pets
router
  .route('/:id')
  .get(catchAsync(petsController.showPet)) // Get a specific pet
  .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(petsController.updatePet)) // Update a pet
  .delete(isLoggedIn, isAuthor, catchAsync(petsController.deletePet)); // Delete a pet
// router
//   .route('/:id')
//   .get(catchAsync(petsController.showPet)) // Get a specific pet
//   .put(isLoggedIn, isAuthor, upload.array('image'), validatePet, catchAsync(petsController.updatePet)) // Update a pet
//   .delete(isLoggedIn, isAuthor, catchAsync(petsController.deletePet)); // Delete a pet

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(petsController.renderEditForm)); // Render edit pet form
// Not working yet, need to get rights to save file on server
router.get('/:id/download-pdf', isLoggedIn, catchAsync(petsController.renderPdf)); // Render pet PDF download

module.exports = router;
