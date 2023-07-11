const User = require('../models/user');
const Comment = require('../models/comment');
const Pet = require('../models/pet');
const { phoneCodeOptions, countryOptions, languageOptions } = require('../utils/userSelectOptions');
const { cloudinary } = require('../cloudinary');
// Import the nodemailer module
const crypto = require('crypto');
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const passport = require('passport');
const nodemailer = require('nodemailer');

module.exports.renderUserProfile = (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    // Render the account page template
    res.render('user/profile', { phoneCodeOptions, countryOptions });
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
  console.log(country);
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

    // Delete the user's pets
    await Pet.deleteMany({ author: user._id });

    // Delete the user's comments
    await Comment.deleteMany({ author: user._id });

    // Delete the user account
    await user.remove();

    // Logout the user session with a callback function
    req.logout((err) => {
      if (err) {
        console.error('Error logging out:', err);
        req.flash('error', 'Failed to delete account. Please try again.');
        res.redirect('/');
        return;
      }

      // Flash a success message
      req.flash('success', 'Account deleted successfully!');

      // Redirect to the homepage or any other appropriate page
      res.redirect('/auth/register');
    });
  } catch (error) {
    console.error('Error deleting account:', error);

    // Flash an error message
    req.flash('error', 'Failed to delete account. Please try again.');

    // Redirect to the account page or any other appropriate page
    res.redirect('/');
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
      // return res.redirect(`/auth/account/profile`);
    }
  } catch (err) {
    console.log(err);
  }

  // mimetype: 'image/jpeg',
  // path: 'https://res.cloudinary.com/dymne7cde/image/upload/v1687102050/useravatar/yskycd2eidbnevvijvy0.jpg',
  // size: 8949,
  // filename: 'useravatar/yskycd2eidbnevvijvy0'
};
