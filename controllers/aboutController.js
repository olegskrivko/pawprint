const nodemailer = require('nodemailer');
const axios = require('axios');

module.exports.index = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const aboutPage = req.__('aboutPage'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    // const myloc = req.locale;
    // console.log('req.locale', myloc);

    res.render('about/index', { aboutPage, navbar });
  } catch (err) {
    console.error(err.message);
    res.redirect('/error');
  }
};

// Repeat the same for the other about controller functions

module.exports.support = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const supportPage = req.__('supportPage'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    res.render('about/support', { supportPage, navbar });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.feedback = async (req, res) => {
  try {
    //const data = req.data; // Language data is available from the middleware
    const feedbackPage = req.__('feedbackPage');
    const selectOptions = req.__('selectOptions'); // Translate the 'about' key based on the user's selected language
    const navbar = req.__('navbar');
    res.render('about/feedback', { feedbackPage, selectOptions, navbar });
  } catch (err) {
    console.error(err.message);
  }
};

// Verify reCAPTCHA response
const verifyCaptcha = async (response) => {
  const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY; // Replace with your secret key obtained from reCAPTCHA
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams();
  params.append('secret', secretKey);
  params.append('response', response);

  try {
    const { data } = await axios.post(url, params);
    console.log('params', params);
    console.log('data', data);
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};

module.exports.sendFeedback = async (req, res) => {
  try {
    const { firstname, lastname, subject, email, description, 'g-recaptcha-response': recaptchaResponse } = req.body;
    console.log('req body', req.body);
    // Verify reCAPTCHA response
    const isCaptchaValid = await verifyCaptcha(recaptchaResponse);
    console.log('isCaptchaValid', isCaptchaValid);

    if (!isCaptchaValid) {
      req.flash('error', 'Please complete the reCAPTCHA to submit the form.');
      return res.redirect('back');
    }

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
      from: 'bugfreecode.paradox@gmail.com',
      to: 'info@pawclix.com',
      subject: subject,
      text: `From ${firstname} ${lastname}\n${description}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        req.flash('success', 'Thank you! Your message has been sent successfully.');
      }
      res.redirect('back');
    });
  } catch (err) {
    console.error('Error sending feedback:', err);
    req.flash('error', 'An error occurred while sending the feedback.');
    res.redirect('back');
  }
};
// module.exports.sendFeedback = async (req, res) => {
//   try {
//     const { firstname, lastname, subject, email, description } = req.body;
//     // Create a transporter using SMTP
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       port: 587,
//       secure: false, // upgrade later with STARTTLS
//       auth: {
//         user: process.env.EMAIL_USERNAME, // Replace with your Gmail address
//         pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password
//       },
//     });

//     // Define the email options
//     console.log(process.env.EMAIL_APP);
//     const mailOptions = {
//       from: email,
//       to: 'info@pawclix.com',
//       subject: subject,
//       text: `From ${firstname} ${lastname}\n${email}\n${description}`,
//     };

//     // Send the email
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//         req.flash('error', 'Error sending message. Please try again.');
//       } else {
//         console.log('Email sent:', info.response);
//         req.flash('success', 'Thank you! Your message has been sent successfully.');
//       }
//       res.redirect('back'); // Redirect back to the same page
//     });
//   } catch (err) {
//     console.error(err.message);
//   }
// };
