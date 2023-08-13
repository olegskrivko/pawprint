const User = require('../models/user');
const Pet = require('../models/pet');

module.exports.renderUserWatchlist = async (req, res) => {
  try {
    const profileTabs = req.__('profileTabs');
    const watchlistPage = req.__('watchlistPage');
    // Retrieve the user's watchlist from the database
    const watchlist = req.user.watchlist;
    // Fetch the pets from the database based on the pet IDs in the watchlist
    const pets = await Pet.find({ _id: { $in: watchlist } });

    // Render the watchlist page with the watchlist data
    res.render('user/watchlist', { pets, watchlistPage, profileTabs });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error rendering account watchlist:', error);

    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    //req.flash("error", "Failed to render account watchlist.");
    //res.redirect("/pets"); // Redirect to an appropriate error page or fallback route
  }
};
// Controller for updating the account watchlist page
module.exports.updateUserWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    let { pets } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    // Ensure pets is an array
    pets = Array.isArray(pets) ? pets : [pets];

    // Loop through the selected pets' IDs
    pets.forEach((petId) => {
      const index = user.watchlist.indexOf(petId);
      if (index !== -1) {
        // If the petId is already in the watchlist, remove it from the array
        user.watchlist.splice(index, 1);
      } else {
        // If the petId is not in the watchlist, add it to the array
        user.watchlist.push(petId);
      }
    });

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'Watchlist updated successfully' });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
};
// Controller for deleting user account watchlist item
module.exports.deleteUserWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const petId = req.params.petId;

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the pet exists in the user's watchlist
    const petIndex = user.watchlist.indexOf(petId);
    if (petIndex !== -1) {
      // Remove the pet from the watchlist array
      user.watchlist.splice(petIndex, 1);

      // Save the updated user data
      await user.save();

      res.status(200).json({ message: 'Pet removed from watchlist successfully' });
    } else {
      res.status(404).json({ error: 'Pet not found in watchlist' });
    }
  } catch (error) {
    console.error('Error removing pet from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove pet from watchlist' });
  }
};
// Controller for deleting all user account watchlist items
// module.exports.deleteAllUserWatchlist = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log('userId to delete wathclist', userId);

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Clear the watchlist array
//     user.watchlist = [];

//     // Save the updated user data
//     await user.save();

//     res.status(200).json({ message: 'All watchlist items removed successfully' });
//   } catch (error) {
//     console.error('Error removing all watchlist items:', error);
//     res.status(500).json({ error: 'Failed to remove all watchlist items' });
//   }
// };
