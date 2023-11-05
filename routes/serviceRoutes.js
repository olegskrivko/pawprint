const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const servicesController = require('../controllers/servicesController');
const multer = require('multer');
const { logostorage } = require('../cloudinary');
const upload = multer({ storage: logostorage });
const { isLoggedIn, isAuthor, languageMiddleware } = require('../middleware/middleware');

// Apply the languageMiddleware to all routes in the router
router.use(languageMiddleware);

router.route('/').get(catchAsync(servicesController.index)).post(isLoggedIn, upload.single('logo'), catchAsync(servicesController.addNewService));
router.route('/new').get(isLoggedIn, servicesController.renderAddServiceForm);
router.route('/:slug').get(catchAsync(servicesController.showService)).put(isLoggedIn, isAuthor, upload.single('logo'), catchAsync(servicesController.updateService)).delete(isLoggedIn, isAuthor, catchAsync(servicesController.deleteService));

module.exports = router;
