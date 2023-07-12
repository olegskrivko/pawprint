module.exports.index = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const about = req.__('about'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    // const myloc = req.locale;
    // console.log('req.locale', myloc);

    res.render('about/index', { about, navbar });
  } catch (err) {
    console.error(err.message);
    res.redirect('/error');
  }
};

// Repeat the same for the other about controller functions

module.exports.support = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const about = req.__('about'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    res.render('about/support', { about, navbar });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.feedback = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const about = req.__('about'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    res.render('about/feedback', { about, navbar });
  } catch (err) {
    console.error(err.message);
  }
};
