module.exports.renderHome = async (req, res) => {
  try {
    const home = req.__('home'); // Translate the 'home' key based on the user's selected language

    res.render('home', { home });
  } catch (err) {
    console.error(err.message);
    res.redirect('/error');
  }
};
