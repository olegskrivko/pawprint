const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');
const User = require('../models/user');

module.exports.renderUserServices = async (req, res) => {
  try {
    const profileTabs = req.__('profileTabs');
    const navbar = req.__('navbar');
    const userServicesPage = req.__('userServicesPage');
    const userServicesList = await req.user.userServices;
    // Fetch the pets from the database based on the pet IDs
    const userServices = await ServiceProvider.find({ _id: { $in: userServicesList } });

    res.render('user/services', { userServices, userServicesPage, profileTabs, navbar });
  } catch (error) {
    console.log(error);
  }
};

// Controller for updating the account watchlist page
module.exports.updateUserServices = async (req, res) => {
  // try {
  //
  //   res.status(200).json({ message: 'Services updated successfully' });
  // } catch (error) {
  //   console.error('Error updating Services:', error);
  //   res.status(500).json({ error: 'Failed to update Services' });
  // }
};

module.exports.deleteUserServices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceProviderId } = req.params;

    // find serviceProvider by ID
    const serviceProvider = await ServiceProvider.findOne({
      _id: serviceProviderId,
    });
    //console.log('serviceProvider', serviceProvider);

    // extract service category name
    const serviceCategoryName = serviceProvider.serviceName;
    // console.log('serviceCategoryName', serviceCategoryName);

    // find associated service category document
    const associatedService = await Service.findOne({ slug: serviceCategoryName });
    //console.log('associatedService', associatedService);

    // find associated service ID
    const associatedServiceId = associatedService._id;
    // console.log('associatedServiceId', associatedServiceId);

    // Delete the serviceProvider from ServiceProvider collection
    const deletedServiceProvider = await ServiceProvider.findByIdAndDelete(serviceProviderId);

    if (!deletedServiceProvider) {
      // No serviceProvider found with the given ID
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    // Check if the serviceProvider exists in the user's service list
    const serviceProviderIndex = user.userServices.indexOf(serviceProviderId);
    const serviceProviderIndexFavorites = user.favorites.indexOf(serviceProviderId);

    if (serviceProviderIndex !== -1) {
      // Remove the serviceProvider from the userServices array
      user.userServices.splice(serviceProviderIndex, 1);
      if (serviceProviderIndexFavorites != -1) {
        // Remove the serviceProvider from the userfavorites array
        user.favorites.splice(serviceProviderIndexFavorites, 1);
      }

      // Save the updated user data
      await user.save();

      if (associatedService) {
        // Update the associated service to remove the deleted serviceProvider
        associatedService.serviceProviders.pull(serviceProviderId);
        await associatedService.save();
      }

      return res.status(200).json({ message: 'Service removed successfully' });
    } else {
      return res.status(404).json({ error: 'Service not found in user watchlist' });
    }
  } catch (error) {
    console.error('Error removing service:', error);
    res.status(500).json({ error: 'Failed to remove service' });
  }
};
