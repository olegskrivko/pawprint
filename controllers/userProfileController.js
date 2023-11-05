const User = require('../models/user');
const Comment = require('../models/comment');
const ServiceProvider = require('../models/serviceProvider');
const Service = require('../models/service');
const Pet = require('../models/pet');
const { phoneCodeOptions, countryOptions, languageOptions } = require('../utils/userSelectOptions');
const { cloudinary } = require('../cloudinary');

module.exports.renderUserProfile = (req, res) => {
  try {
    const navbar = req.__('navbar');
    const profileTabs = req.__('profileTabs');
    const profilePage = req.__('profilePage');
    res.render('user/profile', { phoneCodeOptions, countryOptions, languageOptions, profilePage, profileTabs, navbar });
  } catch (error) {
    console.error('Error rendering account page:', error);
    req.flash('error', 'Failed to render account page.');
    res.redirect('/pets');
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

    req.login(updatedUser, (err) => {
      if (err) {
        console.error('Error updating session:', err);
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ success: false, message: 'Failed to update account' });
  }
};

module.exports.deleteUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const userServiceProviderIds = await ServiceProvider.find({ author: user._id }).distinct('_id');
    await Service.updateMany({ serviceProviders: { $in: userServiceProviderIds } }, { $pull: { serviceProviders: { $in: userServiceProviderIds } } });
    console.log('DELETED ALL ITEMS');
    await Promise.all([Pet.deleteMany({ author: user._id }), Comment.deleteMany({ author: user._id }), ServiceProvider.deleteMany({ author: user._id })]);
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

      req.flash('success', 'Account deleted successfully!');
      // console.log('Flash message set. Redirecting...');
      res.redirect('/auth/register');
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    req.flash('error', 'Failed to delete account. Please try again.');
    res.redirect('/user/profile');
  }
};

module.exports.updateUserProfileAvatar = async (req, res) => {
  const avatar = req.file;
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

module.exports.updateUserSettings = async (req, res, next) => {
  const { language } = req.body;
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

    req.login(updatedUser, (err) => {
      if (err) {
        console.error('Error updating session:', err);
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ success: false, message: 'Failed to update account settings' });
  }
};
