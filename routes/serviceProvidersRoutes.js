const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');

// const servicesController = require('../controllers/servicesController');
const serviceProvidersController = require('../controllers/serviceProvidersController');

// Import middleware functions
const { isLoggedIn, isAuthor, languageMiddleware } = require('../middleware/middleware');
// const multer = require('multer');
// const { logostorage } = require('../cloudinary');
// const upload = multer({ storage: logostorage });

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

// Routes
// router.route('/').get(catchAsync(servicesController.index)).post(isLoggedIn, upload.single('logo'), catchAsync(servicesController.addNewService));
// router.route('/new').get(isLoggedIn, servicesController.renderAddServiceForm);

// Show, update, and delete routes for a specific service - GET /services/:id, PUT /services/:id, DELETE /services/:id
//router.route('/:id').get(catchAsync(servicesController.showService)).put(isLoggedIn, isAuthor, upload.single('logo'), catchAsync(servicesController.updateService)).delete(isLoggedIn, isAuthor, catchAsync(servicesController.deleteService));
// add later middleware to check if its author or not!!!
router.get('/:serviceProviderId', catchAsync(serviceProvidersController.renderServiceProvider)); // Render edit service form

module.exports = router;