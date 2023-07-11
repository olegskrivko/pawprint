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

module.exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    const user = new User({ firstName, lastName, email, username });

    // Generate a verification token
    const verificationToken = await generateVerificationToken();

    // Set the verification token and its expiration time for the user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Register the user using the provided password
    const registeredUser = await User.register(user, password);

    // Save the registered user
    await registeredUser.save();

    // Log in the registered user
    req.login(registeredUser, async (err) => {
      if (err) return next(err);

      // Compose the email message
      const verificationLink = `https://pawclix.cyclic.app/auth/verify/${verificationToken}`;

      // Create a transporter using SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: process.env.EMAIL_USERNAME, // Replace with your Gmail address
          pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password
        },
      });

      // Define the email options
      const mailOptions = {
        from: process.env.EMAIL_USERNAME, // Replace with your Gmail address
        to: email, // Replace with the recipient's email address
        subject: 'Test Email',
        text: `Hello from Nodemailer! ${verificationLink}`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      // const msg = {
      //   to: email,
      //   from: "olegs.krivko@gmail.com", // Replace with your SendGrid verified email address
      //   subject: "Welcome to PawPrint - Verify Your Email",
      //   text: `Dear ${username}, thank you for registering on PawPrint! Please click the following link to verify your email: ${verificationLink}`,
      //   html: `<p>Dear ${username},</p><p>Thank you for registering on PawPrint! Please click the following link to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      // };

      // Send the email
      // await sgMail.send(msg);

      req.flash('success', 'Registration successful! An email with a verification link has been sent to your email address.');
      res.redirect('/pets');
    });
  } catch (error) {
    // Handle errors during registration
    req.flash('error', error.message);
    res.redirect('/auth/register');
  }
};

// module.exports.register = async (req, res, next) => {
//   try {
//     const { email, username, password } = req.body;
//     const user = new User({ email, username });

//     // Generate a verification token
//     const verificationToken = await generateVerificationToken();

//     // Set the verification token and its expiration time for the user
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

//     // Register the user using the provided password
//     const registeredUser = await User.register(user, password);

//     // Save the registered user
//     await registeredUser.save();

//     // Log in the registered user
//     req.login(registeredUser, async (err) => {
//       if (err) return next(err);

//       // Compose the email message
//       const verificationLink = `https://pawprint.cyclic.app/auth/verify/${verificationToken}`;
//       const msg = {
//         to: email,
//         from: "olegs.krivko@gmail.com", // Replace with your SendGrid verified email address
//         subject: "Welcome to PawPrint - Verify Your Email",
//         text: `Dear ${username}, thank you for registering on PawPrint! Please click the following link to verify your email: ${verificationLink}`,
//         html: `<p>Dear ${username},</p><p>Thank you for registering on PawPrint! Please click the following link to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
//       };

//       // Send the email
//       await sgMail.send(msg);

//       req.flash(
//         "success",
//         "Registration successful! An email with a verification link has been sent to your email address."
//       );
//       res.redirect("/pets");
//     });
//   } catch (error) {
//     // Handle errors during registration
//     req.flash("error", error.message);
//     res.redirect("/auth/register");
//   }
// };

// Function to generate a random verification token
async function generateVerificationToken() {
  //const crypto = require("crypto");
  return crypto.randomBytes(32).toString('hex');
}

// Controller for rendering the registration form
module.exports.renderRegister = (req, res) => {
  const data = req.data; // Language data is available from the middleware
  res.render('auth/register', { data });
};

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    console.log('token', token);

    // Find the user with the provided verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    console.log('user', user);
    // If no user found or the token has expired
    if (!user) {
      req.flash('error', 'Invalid or expired verification token.');
      return res.redirect('/auth/login');
    }

    // Update the user's verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    // Save the updated user
    await user.save();

    req.flash('success', 'Your email has been verified successfully. You can now log in.');
    res.redirect('/auth/login');
  } catch (error) {
    req.flash('error', 'An error occurred while verifying your email. Please try again.');
    res.redirect('/auth/login');
  }
};

// module.exports.register = async (req, res, next) => {
//   try {
//     const { email, username, password } = req.body;
//     const user = new User({ email, username });

//     // Register the user using the provided password
//     const registeredUser = await User.register(user, password);

//     // Save the registered user
//     await registeredUser.save();

//     // Log in the registered user
//     req.login(registeredUser, async (err) => {
//       if (err) return next(err);

//       // Compose the email message
//       const msg = {
//         to: `${email}`,
//         from: "olegs.krivko@gmail.com", // Replace with your SendGrid verified email address
//         subject: "Welcome to PawPrint",
//         text: `Dear ${username}, thank you for registering on PawPrint!`,
//         html: `<p>Dear ${username},</p><p>Thank you for registering on PawPrint!</p>`,
//       };

//       // Send the email
//       await sgMail.send(msg);

//       req.flash(
//         "success",
//         "Registration successful! An email has been sent to your email address."
//       );
//       res.redirect("/pets");
//     });
//   } catch (error) {
//     // Handle errors during registration
//     req.flash("error", error.message);
//     res.redirect("auth/register");
//   }
// };

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: "olegs.krivko@inbox.lv", // Change to your recipient
//   from: "olegs.krivko@gmail.com", // Change to your verified sender
//   subject: "Sending with SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log("Email sent");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// Controller for user registration
// module.exports.register = async (req, res, next) => {
//   try {
//     const { email, username, password } = req.body;
//     const user = new User({ email, username });

//     // Register the user using the provided password
//     const registeredUser = await User.register(user, password);

//     // Save the registered user
//     await registeredUser.save();

//     // Log in the registered user
//     req.login(registeredUser, (err) => {
//       if (err) return next(err);
//       req.flash("success", "Registration successful!"); // Flash message for successful registration
//       res.redirect("/pets");
//     });
//   } catch (error) {
//     // Handle errors during registration
//     req.flash("error", error.message);
//     res.redirect("auth/register");
//   }
// };

// Controller for rendering the login page
module.exports.renderLogin = (req, res) => {
  //const data = req.data; // Language data is available from the middleware
  res.render('auth/login'); // Render the login view
};

// // Controller for user login
// module.exports.login = (req, res) => {
//   // Retrieve the user's name
//   const { username } = req.user;

//   // Display a flash message with a welcome greeting and the user's name
//   req.flash('success', `Welcome, ${username}!`);

//   // Retrieve the redirect URL from the session or set a default value
//   const redirectUrl = req.session.returnTo || '/pets';

//   // Delete the returnTo property from the session to prevent future redirections
//   delete req.session.returnTo;

//   // Redirect the user to the determined URL
//   res.redirect(redirectUrl);
// };

module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      // Handle the error (e.g., log it, display an error message)
      return next(err);
    }
    if (!user) {
      // Authentication failed, display an error message
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/auth/login');
    }

    // Authentication succeeded, log in the user
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Redirect the user to the desired page
      return res.redirect('/pets');
    });
  })(req, res, next);
};

// Controller for user logout
module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      // Handle the error appropriately, such as displaying an error message
      req.flash('error', 'Failed to logout.');
    } else {
      // Display a flash message indicating successful logout
      req.flash('success', 'You have been logged out successfully!');

      // Redirect the user to the desired page after logout
      res.redirect('/pets');
    }
  });
};

// Controller to send email verification link for registered user
module.exports.emailVerificationLink = async (req, res) => {
  try {
    const user = req.user;
    // Generate a verification token
    const verificationToken = await generateVerificationToken();
    console.log(verificationToken);

    // Set the verification token and its expiration time for the user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the registered user
    await user.save();

    // Log in the registered user

    // Compose the email message
    const verificationLink = `https://pawclix.cyclic.app/auth/verify/${verificationToken}`;

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.EMAIL_USERNAME, // Replace with your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // Replace with your Gmail address
      to: user.email, // Replace with the recipient's email address
      subject: 'Test Email',
      text: `Hello from Nodemailer! ${verificationLink}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    req.flash('success', 'Verifcation link has been sent to yout email.');
    res.redirect('/user/profile');
  } catch (error) {
    req.flash('error', 'An error occurred while verifying your email. Please try again.');
    res.redirect('/user/profile');
  }
};

// Controller for rendering the account page
// module.exports.renderAccountProfile = (req, res) => {
//   try {
//     const data = req.data; // Language data is available from the middleware
//     // Render the account page template
//     res.render('auth/profile', { phoneCodeOptions, countryOptions, data });
//   } catch (error) {
//     // Log the error for debugging purposes
//     console.error('Error rendering account page:', error);

//     // Handle the error appropriately, such as displaying an error message or redirecting to an error page
//     req.flash('error', 'Failed to render account page.');
//     res.redirect('/pets'); // Redirect to an appropriate error page or fallback route
//   }
// };

// Controller for rendering the account settings page
// module.exports.renderAccountSettings = (req, res) => {
//   try {
//     const data = req.data; // Language data is available from the middleware
//     // Render the account settings page template
//     res.render('auth/settings', { languageOptions, data });
//   } catch (error) {
//     // Log the error for debugging purposes
//     console.error('Error rendering account page:', error);

//     // Handle the error appropriately, such as displaying an error message or redirecting to an error page
//     req.flash('error', 'Failed to render account page.');
//     res.redirect('/pets'); // Redirect to an appropriate error page or fallback route
//   }
// };

// Controller for updating user account information
// module.exports.updateAccount = async (req, res) => {
//   try {
//     const { email, username } = req.body;
//     const user = req.user; // Assuming the authenticated user's data is stored in req.user

//     // Update the user's email and username
//     user.set({ email, username });

//     // Save the updated user data
//     await user.save();

//     // Update the session with the new user data
//     req.session.user = user;

//     // Flash a success message
//     req.flash("success", "Account updated successfully!");

//     // Redirect to the account page or any other appropriate page
//     res.redirect("/auth/account");
//   } catch (error) {
//     console.error("Error updating account:", error);

//     // Flash an error message
//     req.flash("error", "Failed to update account. Please try again.");

//     // Redirect to the account page or any other appropriate page
//     res.redirect("/auth/account");
//   }
// };

//THSI IS THE LAST ONE
//Controller for updating user account information
// module.exports.updateAccount = async (req, res, next) => {
//   const { username } = req.body;
//   const userId = req.user._id;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { username },
//       { new: true }
//     );

//     // Update the session with the new username
//     req.login(updatedUser, (err) => {
//       if (err) {
//         console.error("Error updating session:", err);
//         // Handle the error appropriately
//       }

//       // Redirect the user to a success page or refresh the current page
//       res.redirect("/account");
//     });
//   } catch (error) {
//     console.error("Error updating account:", error);
//     // Handle the error appropriately
//   }
// };

// module.exports.updateAccount = async (req, res, next) => {
//   const { username } = req.body;
//   const userId = req.user._id;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { username },
//       { new: true }
//     );

//     // Update the session with the new username
//     req.login(updatedUser, (err) => {
//       if (err) {
//         console.error("Error updating session:", err);
//         // Handle the error appropriately
//       }

//       // Send a success response to the client
//       res.json({ success: true });
//     });
//   } catch (error) {
//     console.error("Error updating account:", error);
//     // Handle the error appropriately
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to update account" });
//   }
// };

// module.exports.updateProfileAvatar = async (req, res, next) => {
//   const avatar = req.file;
//   // console.log(avatar);
//   const userId = req.user._id;

//   try {
//     if (avatar) {
//       const cloudinaryRes = await cloudinary.uploader.upload(avatar.path);
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         {
//           $set: {
//             avatar: {
//               url: cloudinaryRes.url,
//               filename: cloudinaryRes.public_id,
//             },
//           },
//         },
//         { new: true },
//       );

//       req.flash('success', 'Successfully uploaded avatar!');
//       // return res.redirect(`/auth/account/profile`);
//     }
//   } catch (err) {
//     console.log(err);
//   }

//   // mimetype: 'image/jpeg',
//   // path: 'https://res.cloudinary.com/dymne7cde/image/upload/v1687102050/useravatar/yskycd2eidbnevvijvy0.jpg',
//   // size: 8949,
//   // filename: 'useravatar/yskycd2eidbnevvijvy0'
// };

// module.exports.updateAccount = async (req, res, next) => {
//   const { firstName, lastName, phoneCode, phoneNumber, country } = req.body;
//   console.log(country);
//   const userId = req.user._id;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           firstName,
//           lastName,
//           phoneCode,
//           phoneNumber,
//           'address.country': country,
//         },
//       },
//       { new: true },
//     );

//     // Update the session with the new user information
//     req.login(updatedUser, (err) => {
//       if (err) {
//         console.error('Error updating session:', err);
//         // Handle the error appropriately
//       }

//       // Send a success response to the client
//       res.json({ success: true });
//     });
//   } catch (error) {
//     console.error('Error updating account:', error);
//     // Handle the error appropriately
//     res.status(500).json({ success: false, message: 'Failed to update account' });
//   }
// };

// module.exports.updateAccountSettings = async (req, res, next) => {
//   const { language } = req.body;
//   console.log(language);
//   const userId = req.user._id;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $set: {
//           language,
//         },
//       },
//       { new: true },
//     );

//     // Update the session with the new user information
//     req.login(updatedUser, (err) => {
//       if (err) {
//         console.error('Error updating session:', err);
//         // Handle the error appropriately
//       }

//       // Send a success response to the client
//       res.json({ success: true });
//     });
//   } catch (error) {
//     console.error('Error updating account:', error);
//     // Handle the error appropriately
//     res.status(500).json({ success: false, message: 'Failed to update account settings' });
//   }
// };

// Controller for deleting the account
// module.exports.deleteAccount = async (req, res) => {
//   try {
//     const user = req.user;

//     // Delete the user's pets
//     await Pet.deleteMany({ author: user._id });

//     // Delete the user's comments
//     await Comment.deleteMany({ author: user._id });

//     // Delete the user account
//     await user.remove();

//     // Logout the user session with a callback function
//     req.logout((err) => {
//       if (err) {
//         console.error('Error logging out:', err);
//         req.flash('error', 'Failed to delete account. Please try again.');
//         res.redirect('/');
//         return;
//       }

//       // Flash a success message
//       req.flash('success', 'Account deleted successfully!');

//       // Redirect to the homepage or any other appropriate page
//       res.redirect('/auth/register');
//     });
//   } catch (error) {
//     console.error('Error deleting account:', error);

//     // Flash an error message
//     req.flash('error', 'Failed to delete account. Please try again.');

//     // Redirect to the account page or any other appropriate page
//     res.redirect('/');
//   }
// };
