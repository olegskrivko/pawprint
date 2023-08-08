const User = require('../models/user');
const Pet = require('../models/pet');

module.exports.renderUserPets = async (req, res) => {
  try {
    const userPetsPage = req.__('userPetsPage');
    const userPetsList = await req.user.userPets;
    console.log('userPetsList', userPetsList);
    // Fetch the pets from the database based on the pet IDs
    const userPets = await Pet.find({ _id: { $in: userPetsList } });
    res.render('user/pets', { userPets, userPetsPage });
  } catch (error) {
    console.log(error);
  }
};
