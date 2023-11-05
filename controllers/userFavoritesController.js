const User = require('../models/user');
const ServiceProvider = require('../models/serviceProvider');

module.exports.renderUserFavorites = async (req, res) => {
  const navbar = req.__('navbar');
  const profileTabs = req.__('profileTabs');
  const favoritesPage = req.__('favoritesPage');
  const favoritesList = req.user.favorites;
  const favorites = await ServiceProvider.find({ _id: { $in: favoritesList } });
  res.render('user/favorites', { favorites, favoritesPage, profileTabs, navbar });
};

module.exports.updateUserFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    let { service } = req.body;
    const user = await User.findById(userId);
    service = Array.isArray(service) ? service : [service];
    service.forEach((serviceId) => {
      const index = user.favorites.indexOf(serviceId);
      if (index !== -1) {
        user.favorites.splice(index, 1);
      } else {
        user.favorites.push(serviceId);
      }
    });

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
    const user = await User.findById(userId);
    const favoritesIndex = user.favorites.indexOf(favoriteId);
    if (favoritesIndex !== -1) {
      user.favorites.splice(favoritesIndex, 1);
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
