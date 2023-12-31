const Pet = require('../models/pet');

module.exports.compare = async (req, res) => {
  try {
    // Retrieve the language preference and data from the response locals
    const navbar = req.__('navbar');
    const petsIds = req.params.id.split(',');
    const pets = await Pet.find({ _id: { $in: petsIds } });
    if (!pets) {
      return res.redirect('/pets');
    }

    res.render('compare/compare', { pets, navbar });
  } catch (err) {
    console.log(err);
  }
};
