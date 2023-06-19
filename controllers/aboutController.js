// module.exports.index = async (req, res) => {
//   try {
//     res.render("about/index");
//   } catch (err) {
//     console.error(err.message);
//   }
// };
const User = require("../models/user"); // Assuming your user model is defined in '../models/user.js'
const enData = require("../locales/en.json");
const lvData = require("../locales/lv.json");

module.exports.index = async (req, res) => {
  try {
    let userLanguage;

    if (req.isAuthenticated()) {
      // User is logged in, retrieve language preference from user profile
      const user = await User.findById(req.user.id);
      userLanguage = user.language;
    } else {
      // User is not logged in, retrieve language preference from request headers
      userLanguage = req.headers["accept-language"];
    }

    // Retrieve the corresponding data based on the user's language preference
    const data =
      userLanguage && userLanguage.startsWith("lv") ? lvData : enData;

    res.render("about/index", { data });
  } catch (err) {
    console.error(err.message);
    // Handle the error or redirect to an appropriate error page
    res.redirect("/error");
  }
};

// module.exports.index = async (req, res) => {
//   try {
//     const username = req.session.passport.user;

//     if (username) {
//       const user = await User.findOne({ username });

//       if (user && user.language) {
//         // Retrieve the corresponding data based on the user's language
//         const userLanguage = user.language;
//         const data = userLanguage === "lv" ? lvData : enData;

//         res.render("about/index", { data });
//         return; // Exit the function to prevent further execution
//       }
//     }

//     // If no valid user or language is found, render with default data
//     res.render("about/index", { data: enData });
//   } catch (err) {
//     console.error(err.message);
//     // Handle the error or redirect to an appropriate error page
//     res.redirect("/error");
//   }
// };

// const fs = require("fs");

// module.exports.index = async (req, res) => {
//   try {
//     const lang = req.params.lang || "en"; // Get the language from the parameter or default to 'en'

//     // Read the language file
//     const translations = JSON.parse(
//       fs.readFileSync(`locales/${lang}.json`, "utf8")
//     );

//     res.render("about/index", { translations: translations.about }); // Pass the translations to the view
//   } catch (err) {
//     console.error(err.message);
//   }
// };

// Repeat the same for the other about controller functions

module.exports.support = async (req, res) => {
  try {
    res.render("about/support");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.feedback = async (req, res) => {
  try {
    res.render("about/feedback");
  } catch (err) {
    console.error(err.message);
  }
};

// module.exports.index = async (req, res) => {
//   try {
//     const lang = req.params.lang || 'en'; // Get the language from the parameter or default to 'en'
//     res.render(`about/${lang}/index`); // Render the appropriate view based on the language
//   } catch (err) {
//     console.error(err.message);
//   }
// };

// module.exports.support = async (req, res) => {
//   try {
//     const lang = req.params.lang || 'en'; // Get the language from the parameter or default to 'en'
//     res.render(`about/${lang}/support`); // Render the appropriate view based on the language
//   } catch (err) {
//     console.error(err.message);
//   }
// };

// module.exports.feedback = async (req, res) => {
//   try {
//     const lang = req.params.lang || 'en'; // Get the language from the parameter or default to 'en'
//     res.render(`about/${lang}/feedback`); // Render the appropriate view based on the language
//   } catch (err) {
//     console.error(err.message);
//   }
// };
