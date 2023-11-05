module.exports.renderHome = async (req, res) => {
  try {
    const navbar = req.__('navbar');
    const homePage = req.__('homePage');
    res.render('home', { homePage, navbar });
  } catch (err) {
    console.error(err.message);
    res.redirect('/');
  }
};
