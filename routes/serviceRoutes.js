const express = require("express");
const router = express.Router({ mergeParams: true });
const servicesController = require("../controllers/servicesController");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const { logostorage } = require("../cloudinary");
const upload = multer({ storage: logostorage });
const { isLoggedIn, isAuthor } = require("../middleware/middleware");

// Routes

// Index route - GET /services
router
  .route("/")
  .get(catchAsync(servicesController.index))
  .post(
    isLoggedIn,
    upload.single("logo"),
    catchAsync(servicesController.addNewService)
  );

// New service form route - GET /services/new
router.route("/new").get(isLoggedIn, servicesController.renderAddServiceForm);

// Show, update, and delete routes for a specific service - GET /services/:id, PUT /services/:id, DELETE /services/:id
router
  .route("/:id")
  .get(catchAsync(servicesController.showService))
  .put(
    isLoggedIn,
    isAuthor,
    upload.single("logo"),
    catchAsync(servicesController.updateService)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(servicesController.deleteService));

module.exports = router;
