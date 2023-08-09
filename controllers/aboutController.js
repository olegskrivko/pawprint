const nodemailer = require('nodemailer');
const axios = require('axios');

module.exports.index = async (req, res) => {
  try {
    const aboutPage = req.__('aboutPage');
    const navbar = req.__('navbar');
    res.render('about/index', { aboutPage, navbar });
  } catch (err) {
    console.error(err.message);
    res.redirect('/error');
  }
};

module.exports.support = async (req, res) => {
  try {
    const supportPage = req.__('supportPage');
    const navbar = req.__('navbar');
    res.render('about/support', { supportPage, navbar });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports.feedback = async (req, res) => {
  try {
    const feedbackPage = req.__('feedbackPage');
    const selectOptions = req.__('selectOptions');
    const navbar = req.__('navbar');
    res.render('about/feedback', { feedbackPage, selectOptions, navbar });
  } catch (err) {
    console.error(err.message);
  }
};

// Verify reCAPTCHA response
const verifyCaptcha = async (response) => {
  const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams();
  params.append('secret', secretKey);
  params.append('response', response);

  try {
    const { data } = await axios.post(url, params);
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};

module.exports.sendFeedback = async (req, res) => {
  try {
    const { firstname, lastname, subject, email, description, 'g-recaptcha-response': recaptchaResponse } = req.body;
    // Verify reCAPTCHA response
    const isCaptchaValid = await verifyCaptcha(recaptchaResponse);

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
        user: process.env.APP_EMAIL_USERNAME,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.APP_EMAIL_USERNAME,
      to: process.env.APP_EMAIL_USERNAME_PROD,
      subject: subject,
      text: `From ${firstname} ${lastname}\n${description}\nEmail: ${email}`,
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
