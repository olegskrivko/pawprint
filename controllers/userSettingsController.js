const User = require('../models/user');
const { languageOptions } = require('../utils/userSelectOptions');

module.exports.renderUserSettings = (req, res) => {
  try {
    // Render the account settings page template
    res.render('user/settings', { languageOptions });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error rendering account page:', error);
    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    req.flash('error', 'Failed to render account settings page.');
    res.redirect('/pets'); // Redirect to an appropriate error page or fallback route
  }
};

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
