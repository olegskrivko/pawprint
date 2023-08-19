module.exports.renderHome = async (req, res) => {
  try {
    const navbar = req.__('navbar');
    const homePage = req.__('homePage'); // Translate the 'homePage' key based on the user's selected language
    res.render('home', { homePage, navbar });
  } catch (err) {
    console.error(err.message);
    res.redirect('/');
  }
};
