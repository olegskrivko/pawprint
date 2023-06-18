const express = require("express");
const router = express.Router({ mergeParams: true });
const aboutController = require("../controllers/aboutController");
const catchAsync = require("../utils/catchAsync");

router.route("/").get(catchAsync(aboutController.index));
router.route("/support").get(catchAsync(aboutController.support));
router.route("/feedback").get(catchAsync(aboutController.feedback));

module.exports = router;

// routes
// router.route("/").get(catchAsync(aboutController.index));
// router.route("/support").get(catchAsync(aboutController.support));
// router.route("/feedback").get(catchAsync(aboutController.feedback));

// router.get('/:lang?', function(req, res) {
//     const lang = req.params.lang;
//     if (lang) {
//       res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // Set language cookie
//       req.setLocale(lang); // Set language for current request
//     }
//     res.render('index');
//   });

// router.get("/:lang?", catchAsync(aboutController.index));

// module.exports = router;
