const User = require("../models/user");
const Comment = require("../models/comment");
const Pet = require("../models/pet");
const {
  phoneCodeOptions,
  countryOptions,
  languageOptions,
} = require("../utils/userSelectOptions");
const { cloudinary } = require("../cloudinary");
// Import the nodemailer module
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });

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
      const verificationLink = `http://localhost:3000/auth/verify/${verificationToken}`;
      const msg = {
        to: email,
        from: "olegs.krivko@gmail.com", // Replace with your SendGrid verified email address
        subject: "Welcome to PawPrint - Verify Your Email",
        text: `Dear ${username}, thank you for registering on PawPrint! Please click the following link to verify your email: ${verificationLink}`,
        html: `<p>Dear ${username},</p><p>Thank you for registering on PawPrint! Please click the following link to verify your email:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      };

      // Send the email
      await sgMail.send(msg);

      req.flash(
        "success",
        "Registration successful! An email with a verification link has been sent to your email address."
      );
      res.redirect("/pets");
    });
  } catch (error) {
    // Handle errors during registration
    req.flash("error", error.message);
    res.redirect("auth/register");
  }
};

// Function to generate a random verification token
async function generateVerificationToken() {
  //const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

// Controller for rendering the registration form
module.exports.renderRegister = (req, res) => {
  res.render("auth/register");
};

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    console.log("token", token);

    // Find the user with the provided verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    console.log("user", user);
    // If no user found or the token has expired
    if (!user) {
      req.flash("error", "Invalid or expired verification token.");
      return res.redirect("/auth/login");
    }

    // Update the user's verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    // Save the updated user
    await user.save();

    req.flash(
      "success",
      "Your email has been verified successfully. You can now log in."
    );
    res.redirect("/auth/login");
  } catch (error) {
    req.flash(
      "error",
      "An error occurred while verifying your email. Please try again."
    );
    res.redirect("/auth/login");
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
  res.render("auth/login"); // Render the login view
};

// Controller for user login
module.exports.login = (req, res) => {
  // Retrieve the user's name
  const { username } = req.user;

  // Display a flash message with a welcome greeting and the user's name
  req.flash("success", `Welcome, ${username}!`);

  // Retrieve the redirect URL from the session or set a default value
  const redirectUrl = req.session.returnTo || "/pets";

  // Delete the returnTo property from the session to prevent future redirections
  delete req.session.returnTo;

  // Redirect the user to the determined URL
  res.redirect(redirectUrl);
};

// Controller for user logout
module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      // Handle the error appropriately, such as displaying an error message
      req.flash("error", "Failed to logout.");
    } else {
      // Display a flash message indicating successful logout
      req.flash("success", "You have been logged out successfully!");

      // Redirect the user to the desired page after logout
      res.redirect("/pets");
    }
  });
};

// Controller for rendering the account page
module.exports.renderAccountProfile = (req, res) => {
  try {
    // Render the account page template
    res.render("auth/profile", { phoneCodeOptions, countryOptions });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error rendering account page:", error);

    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    req.flash("error", "Failed to render account page.");
    res.redirect("/pets"); // Redirect to an appropriate error page or fallback route
  }
};

// Controller for rendering the account settings page
module.exports.renderAccountSettings = (req, res) => {
  try {
    // Render the account settings page template
    res.render("auth/settings", { languageOptions });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error rendering account page:", error);

    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    req.flash("error", "Failed to render account page.");
    res.redirect("/pets"); // Redirect to an appropriate error page or fallback route
  }
};

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

module.exports.updateProfileAvatar = async (req, res, next) => {
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
        { new: true }
      );

      req.flash("success", "Successfully uploaded avatar!");
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

module.exports.updateAccount = async (req, res, next) => {
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
          "address.country": country,
        },
      },
      { new: true }
    );

    // Update the session with the new user information
    req.login(updatedUser, (err) => {
      if (err) {
        console.error("Error updating session:", err);
        // Handle the error appropriately
      }

      // Send a success response to the client
      res.json({ success: true });
    });
  } catch (error) {
    console.error("Error updating account:", error);
    // Handle the error appropriately
    res
      .status(500)
      .json({ success: false, message: "Failed to update account" });
  }
};

module.exports.updateAccountSettings = async (req, res, next) => {
  const { language } = req.body;
  console.log(language);
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          language,
        },
      },
      { new: true }
    );

    // Update the session with the new user information
    req.login(updatedUser, (err) => {
      if (err) {
        console.error("Error updating session:", err);
        // Handle the error appropriately
      }

      // Send a success response to the client
      res.json({ success: true });
    });
  } catch (error) {
    console.error("Error updating account:", error);
    // Handle the error appropriately
    res
      .status(500)
      .json({ success: false, message: "Failed to update account settings" });
  }
};

// Controller for deleting the account
module.exports.deleteAccount = async (req, res) => {
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
        console.error("Error logging out:", err);
        req.flash("error", "Failed to delete account. Please try again.");
        res.redirect("/");
        return;
      }

      // Flash a success message
      req.flash("success", "Account deleted successfully!");

      // Redirect to the homepage or any other appropriate page
      res.redirect("/auth/register");
    });
  } catch (error) {
    console.error("Error deleting account:", error);

    // Flash an error message
    req.flash("error", "Failed to delete account. Please try again.");

    // Redirect to the account page or any other appropriate page
    res.redirect("/");
  }
};

// Controller for rendering the account watchlist page
module.exports.renderAccountWatchlist = async (req, res) => {
  try {
    // Retrieve the user's watchlist from the database
    const watchlist = req.user.watchlist;

    // Fetch the pets from the database based on the pet IDs in the watchlist
    const pets = await Pet.find({ _id: { $in: watchlist } });

    // Render the watchlist page with the watchlist data
    res.render("auth/watchlist", { pets });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error rendering account watchlist:", error);

    // Handle the error appropriately, such as displaying an error message or redirecting to an error page
    //req.flash("error", "Failed to render account watchlist.");
    //res.redirect("/pets"); // Redirect to an appropriate error page or fallback route
  }
};

// Controller for updating the account watchlist page
module.exports.updateAccountWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    let { pets } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    // Convert the watchlist array to a set
    const watchlistSet = new Set(user.watchlist);

    // Ensure pets is an array
    pets = Array.isArray(pets) ? pets : [pets];

    // Add the selected pets' IDs to the watchlist set
    pets.forEach((petId) => watchlistSet.add(petId));

    // Convert the watchlist set back to an array
    user.watchlist = Array.from(watchlistSet);

    // Save the updated user data
    await user.save();

    res.status(200).json({ message: "Watchlist updated successfully" });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ error: "Failed to update watchlist" });
  }
};
// Controller for deleting user account watchlist item
module.exports.deleteAccountWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const petId = req.params.petId;
    console.log("petId", petId);

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the pet exists in the user's watchlist
    const petIndex = user.watchlist.indexOf(petId);
    if (petIndex !== -1) {
      // Remove the pet from the watchlist array
      user.watchlist.splice(petIndex, 1);

      // Save the updated user data
      await user.save();

      res
        .status(200)
        .json({ message: "Pet removed from watchlist successfully" });
    } else {
      res.status(404).json({ error: "Pet not found in watchlist" });
    }
  } catch (error) {
    console.error("Error removing pet from watchlist:", error);
    res.status(500).json({ error: "Failed to remove pet from watchlist" });
  }
};
