const User = require('../models/user');
const Comment = require('../models/comment');
const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');
const Pet = require('../models/pet');
const { phoneCodeOptions, countryOptions, languageOptions } = require('../utils/userSelectOptions');
const { cloudinary } = require('../cloudinary');

module.exports.renderUserProfile = (req, res) => {
  try {
    const profileTabs = req.__('profileTabs');
    const profilePage = req.__('profilePage');

    // Render the account page template
    res.render('user/profile', { phoneCodeOptions, countryOptions, languageOptions, profilePage, profileTabs });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error rendering account page:', error);

    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    req.flash('error', 'Failed to render account page.');
    res.redirect('/pets'); // Redirect to an appropriate error page or fallback route
  }
};

module.exports.updateUserProfile = async (req, res) => {
  const { firstName, lastName, phoneCode, phoneNumber, country } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName,
          lastName,
          phoneCode,
          phoneNumber,
          'address.country': country,
        },
      },
      { new: true },
    );

    // Update the session with the new user information
    req.login(updatedUser, (err) => {
      if (err) {
        console.error('Error updating session:', err);
        // Handle the error appropriately
      }

      // Send a success response to the client
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error updating account:', error);
    // Handle the error appropriately
    res.status(500).json({ success: false, message: 'Failed to update account' });
  }
};

module.exports.deleteUserProfile = async (req, res) => {
  try {
    const user = req.user;
    // delete user`s created pets and all coments, deletes also favorited pets, his pets, favorited services
    // Get the IDs of the user's service providers
    const userServiceProviderIds = await ServiceProvider.find({ author: user._id }).distinct('_id');
    // Update documents referencing the deleted service providers to remove the references
    // $in: This is a query operator that checks if the specified field contains any of the values in the array that follows.
    await Service.updateMany(
      { serviceProviders: { $in: userServiceProviderIds } }, // Update documents with references to the deleted service providers
      { $pull: { serviceProviders: { $in: userServiceProviderIds } } }, // Remove the references from the array
    );
    // Delete the user's pets, comments, and service providers
    console.log('DELETED ALL ITEMS');
    await Promise.all([Pet.deleteMany({ author: user._id }), Comment.deleteMany({ author: user._id }), ServiceProvider.deleteMany({ author: user._id })]);
    // find all service prividers, need to find asociated service categories
    // should be continued.
    // 1) find all users services
    // 2) get their serviceName
    // 3) find asociated service categories in Slug field.
    // 4) delete necesary services from Service.serviceProviders
    // 5) delete from service providers as well
    //const serviceProviders = await ServiceProvider.find({ author: user._id });
    //console.log('Service providers:', serviceProviders);

    // this logis is recreated above
    // Delete the user's pets
    // await Pet.deleteMany({ author: user._id });
    // // Delete the user's comments
    // await Comment.deleteMany({ author: user._id });
    // // Delete the user's services
    // await ServiceProvider.deleteMany({ author: user._id });

    // Delete the user account
    //await user.remove(); // It does not trigger Mongoose middleware hooks.
    await User.findByIdAndDelete(req.user._id); //It also triggers Mongoose middleware hooks (e.g., pre and post hooks) if they are set up.

    // Logout the user session with a callback function
    req.logout((err) => {
      if (err) {
        console.error('Error logging out:', err);
        req.flash('error', 'Failed to delete account. Please try again.');
        // this doesnt work...
        res.redirect('/user/profile');
        return;
      }

      // Flash a success message
      req.flash('success', 'Account deleted successfully!');
      console.log('Flash message set. Redirecting...');
      // Redirect to the homepage or any other appropriate page
      res.redirect('/auth/register');
    });
  } catch (error) {
    console.error('Error deleting account:', error);

    // Flash an error message
    req.flash('error', 'Failed to delete account. Please try again.');
    // Redirect to the account page or any other appropriate page
    res.redirect('/user/profile');
  }
};

module.exports.updateUserProfileAvatar = async (req, res) => {
  const avatar = req.file;
  // console.log(avatar);
  const userId = req.user._id;

  try {
    if (avatar) {
      const cloudinaryRes = await cloudinary.uploader.upload(avatar.path);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            avatar: {
              url: cloudinaryRes.url,
              filename: cloudinaryRes.public_id,
            },
          },
        },
        { new: true },
      );

      req.flash('success', 'Successfully uploaded avatar!');
      return res.redirect(`/user/profile`);
    }
  } catch (err) {
    console.log(err);
  }
};

// module.exports.renderUserSettings = (req, res) => {
//   try {
//     // Render the account settings page template
//     res.render('user/settings', { languageOptions });
//   } catch (error) {
//     // Log the error for debugging purposes
//     console.error('Error rendering account page:', error);
//     // Handle the error appropriately, such as displaying an error message or redirecting to an error page
//     req.flash('error', 'Failed to render account settings page.');
//     res.redirect('/pets'); // Redirect to an appropriate error page or fallback route
//   }
// };

module.exports.updateUserSettings = async (req, res, next) => {
  const { language } = req.body;
  // console.log(language);
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          language,
        },
      },
      { new: true },
    );

    // Update the session with the new user information
    req.login(updatedUser, (err) => {
      if (err) {
        console.error('Error updating session:', err);
        // Handle the error appropriately
      }

      // Send a success response to the client
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error updating account:', error);
    // Handle the error appropriately
    res.status(500).json({ success: false, message: 'Failed to update account settings' });
  }
};
