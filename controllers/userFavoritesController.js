const User = require('../models/user');
const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');

// module.exports.renderUserWatchlist = async (req, res) => {
//   try {
//     // Retrieve the user's watchlist from the database
//     const favorites = req.user.favorites;
//     // Fetch the pets from the database based on the pet IDs in the watchlist
//     const pets = await ServiceProvider.find({ _id: { $in: watchlist } });

//     // Render the watchlist page with the watchlist data
//     res.render('user/watchlist', { pets });
//   } catch (error) {
//     // Log the error for debugging purposes
//     console.error('Error rendering account watchlist:', error);

//     // Handle the error appropriately, such as displaying an error message or redirecting to an error page
//     //req.flash("error", "Failed to render account watchlist.");
//     //res.redirect("/pets"); // Redirect to an appropriate error page or fallback route
//   }
// };

module.exports.renderUserFavorites = async (req, res) => {
  const favoritesPage = req.__('favoritesPage');
  // Retrieve the user's favorites from the database
  const favoritesList = req.user.favorites;
  // Fetch the services from the database based on the service IDs in the favorites
  const favorites = await ServiceProvider.find({ _id: { $in: favoritesList } });

  // Render the favorites page with the service data
  res.render('user/favorites', { favorites, favoritesPage });
};

// Controller for deleting all user account favorites items
// module.exports.deleteAllUserFavorites = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     console.log('userId to delete wathclist', userId);

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Clear the watchlist array
//     user.favorites = [];

//     // Save the updated user data
//     await user.save();

//     res.status(200).json({ message: 'All favorites items removed successfully' });
//   } catch (error) {
//     console.error('Error removing all favorites items:', error);
//     res.status(500).json({ error: 'Failed to remove all favorites items' });
//   }
// };

module.exports.updateUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    let { service } = req.body;
    console.log(userId);
    console.log(service);
    // Find the user by ID
    const user = await User.findById(userId);
    //updateUserFavorites
    // Ensure pets is an array
    service = Array.isArray(service) ? service : [service];

    // Loop through the selected pets' IDs
    service.forEach((serviceId) => {
      const index = user.favorites.indexOf(serviceId);
      if (index !== -1) {
        // If the petId is already in the watchlist, remove it from the array
        user.favorites.splice(index, 1);
      } else {
        // If the petId is not in the watchlist, add it to the array
        user.favorites.push(serviceId);
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

module.exports.deleteUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const favoriteId = req.params.favoriteId;
    console.log('favoriteId', favoriteId);

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the pet exists in the user's watchlist
    const favoritesIndex = user.favorites.indexOf(favoriteId);
    if (favoritesIndex !== -1) {
      // Remove the pet from the watchlist array
      user.favorites.splice(favoritesIndex, 1);

      // Save the updated user data
      await user.save();

      res.status(200).json({ message: 'Service removed from favorites successfully' });
    } else {
      res.status(404).json({ error: 'Service not found in favorites' });
    }
  } catch (error) {
    console.error('Error removing Service from favorites:', error);
    res.status(500).json({ error: 'Failed to remove Service from favorites' });
  }
};
