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
      //const verificationLink = `https://pawclix.cyclic.app/auth/verify/${verificationToken}`;
      const verificationLink = `https://www.pawclix.com/auth/verify/${verificationToken}`;

      // Create a transporter using SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: process.env.APP_EMAIL_USERNAME, // Replace with your Gmail address
          pass: process.env.APP_EMAIL_PASSWORD, // Replace with your Gmail password
        },
      });
      console.log('transporter', transporter);

      // Define the email options
      const mailOptions = {
        from: process.env.APP_EMAIL_USERNAME, // Replace with your Gmail address
        to: email, // Replace with the recipient's email address
        subject: 'Verify Your Email Address for Pawclix',
        text: `Welcome to Pawclix!\nThank you for registering on Pawclix!\nPlease verify your email by clicking the link below!\n${verificationLink}`,
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
  const registerPage = req.__('registerPage');
  const navbar = req.__('navbar');
  // console.log(registerPage);
  res.render('auth/register', { registerPage, navbar });
};

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    //console.log('token', token);

    // Find the user with the provided verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    //console.log('user', user);
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

module.exports.renderLogin = (req, res) => {
  // Language data is available from the middleware

  const loginPage = req.__('loginPage');
  const navbar = req.__('navbar');

  res.render('auth/login', { loginPage, navbar }); // Render the login view
};

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
    // console.log(verificationToken);

    // Set the verification token and its expiration time for the user
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the registered user
    await user.save();

    // Log in the registered user

    // Compose the email message
    // const verificationLink = `https://pawclix.cyclic.app/auth/verify/${verificationToken}`;
    const verificationLink = `https://www.pawclix.com/auth/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587, // Port for secure SMTP (e.g., 465 for SSL)
      secure: false, // Use SSL // upgrade later with STARTTLS ???
      auth: {
        user: process.env.APP_EMAIL_USERNAME, // Replace with your Gmail address
        pass: process.env.APP_EMAIL_PASSWORD, // Replace with your Gmail password
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.APP_EMAIL_USERNAME, // Replace with your Gmail address
      to: user.email, // Replace with the recipient's email address
      subject: 'Verify Your Email Address for Pawclix',
      text: `We're excited to have you join PawClix!\nPlease verify your email by clicking the link below!\n${verificationLink}`,
    };
    //console.log('mailOptions', mailOptions);

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
