const Pet = require('../models/pet');

module.exports.compare = async (req, res) => {
  try {
    // Retrieve the language preference and data from the response locals
    const data = req.data; // Language data is available from the middleware    const petsIds = req.params.id.split(",");
    const pets = await Pet.find({ _id: { $in: petsIds } });
    if (!pets) {
      return res.redirect('/pets');
    }

    console.log('pets', pets);
    res.render('compare/compare', { pets, data });
  } catch (err) {
    console.log(err);
    // Handle error and display appropriate message
  }
};
