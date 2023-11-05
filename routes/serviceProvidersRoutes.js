const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const serviceProvidersController = require('../controllers/serviceProvidersController');
const { languageMiddleware } = require('../middleware/middleware');

router.use(languageMiddleware);

router.get('/:serviceProviderId', catchAsync(serviceProvidersController.renderServiceProvider));

module.exports = router;
