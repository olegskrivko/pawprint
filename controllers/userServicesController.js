const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');
const User = require('../models/user');

module.exports.renderUserServices = async (req, res) => {
  try {
    const userServicesList = await req.user.userServices;
    // Fetch the pets from the database based on the pet IDs
    const userServices = await ServiceProvider.find({ _id: { $in: userServicesList } });

    console.log('userServices', userServices);

    res.render('user/services', { userServices });
  } catch (error) {
    console.log(error);
  }
};

// Controller for deleting all user account watchlist items
module.exports.deleteAllUserServices = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('userId to delete services', userId);

    // Find the user by ID
    const user = await User.findById(userId);

    // Clear the user Services array
    user.userServices = [];

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'All user services removed successfully' });
  } catch (error) {
    console.error('Error removing all user services:', error);
    res.status(500).json({ error: 'Failed to remove all user services' });
  }
};

////////////////////////
// Controller for updating the account watchlist page
module.exports.updateUserServices = async (req, res) => {
  // try {
  //   const userId = req.user._id;
  //   let { pets } = req.body;
  //   // Find the user by ID
  //   const user = await User.findById(userId);
  //   // Convert the watchlist array to a set
  //   const watchlistSet = new Set(user.watchlist);
  //   // Ensure pets is an array
  //   pets = Array.isArray(pets) ? pets : [pets];
  //   // Add the selected pets' IDs to the watchlist set
  //   pets.forEach((petId) => watchlistSet.add(petId));
  //   // Convert the watchlist set back to an array
  //   user.watchlist = Array.from(watchlistSet);
  //   // Save the updated user data
  //   await user.save();
  //   res.status(200).json({ message: 'Watchlist updated successfully' });
  // } catch (error) {
  //   console.error('Error updating watchlist:', error);
  //   res.status(500).json({ error: 'Failed to update watchlist' });
  // }
};
// Controller for deleting user account watchlist item
module.exports.deleteUserServices = async (req, res) => {
  // try {
  //   const userId = req.user._id;
  //   const petId = req.params.petId;
  //   console.log('petId', petId);
  //   // Find the user by ID
  //   const user = await User.findById(userId);
  //   // Check if the pet exists in the user's watchlist
  //   const petIndex = user.watchlist.indexOf(petId);
  //   if (petIndex !== -1) {
  //     // Remove the pet from the watchlist array
  //     user.watchlist.splice(petIndex, 1);
  //     // Save the updated user data
  //     await user.save();
  //     res.status(200).json({ message: 'Pet removed from watchlist successfully' });
  //   } else {
  //     res.status(404).json({ error: 'Pet not found in watchlist' });
  //   }
  // } catch (error) {
  //   console.error('Error removing pet from watchlist:', error);
  //   res.status(500).json({ error: 'Failed to remove pet from watchlist' });
  // }
};
