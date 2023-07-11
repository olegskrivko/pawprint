const User = require('../models/user');

module.exports.renderUserFavorites = (req, res) => {
  res.render('user/favorites');
};

// Controller for deleting all user account watchlist items
module.exports.deleteAllUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('userId to delete wathclist', userId);

    // Find the user by ID
    const user = await User.findById(userId);

    // Clear the watchlist array
    user.favorites = [];

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: 'All favorites items removed successfully' });
  } catch (error) {
    console.error('Error removing all favorites items:', error);
    res.status(500).json({ error: 'Failed to remove all favorites items' });
  }
};
