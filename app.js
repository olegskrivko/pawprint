// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Import required libraries
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const ExpressError = require('./utils/ExpressError');
// Import routes
const homeRoutes = require('./routes/homeRoutes');
const userRoutes = require('./routes/userRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceProvidersRoutes = require('./routes/serviceProvidersRoutes');
const petRoutes = require('./routes/petRoutes');
const compareRoutes = require('./routes/compareRoutes');
const commentRoutes = require('./routes/commentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const userWatchlistRoutes = require('./routes/userWatchlistRoutes');
const userFavouritesRoutes = require('./routes/userFavouritesRoutes');
const userServicesRoutes = require('./routes/userServicesRoutes');
const userPetsRoutes = require('./routes/userPetsRoutes');

// Import model
const User = require('./models/user');

// Create Express app
const app = express();

// Set up Express app
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser());

// Configure i18n middleware
i18n.configure({
  locales: ['en', 'lv', 'ru'], // Add all supported locales here
  defaultLocale: 'lv', // Set the default locale
  directory: path.join(__dirname, 'locales'), // Set the directory where translation files are located
  header: 'accept-language', // Set the header field to retrieve the language preference from the request headers
  queryParameter: 'lang', // Set the query parameter to specify the language in the URL
  cookie: 'lang', // Set the cookie name to store the selected language
  register: global, // Register the i18n module in the global scope for easy access
});

app.use(i18n.init); // Initialize the i18n module

app.use((req, res, next) => {
  const userLanguage = req.headers['accept-language'];
  // Determine user's preferred language
  const primaryLanguage = userLanguage.split(',')[0].split('-')[0];
  // Set the determined language as a variable accessible in your routes
  res.locals.userLanguage = primaryLanguage;
  next();
});

// Middleware to set the language cookie
app.use((req, res, next) => {
  console.log('req.cookies.lang', req.cookies.lang);
  const selectedLanguage = req.cookies.lang || req.get('accept-language') || 'lv';
  res.cookie('lang', selectedLanguage, { maxAge: 1000 * 60 * 60 * 24 * 7 }); // Set the language cookie with a maxAge of 7 days
  next();
});

// Connect to MongoDB
const dbURL = process.env.DB_URL;
mongoose
  .connect(dbURL, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('MongoDB connection error: ', error);
  });

// Set up the session store
const secret = process.env.SECRET;
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js authentication
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make currentUser, success, and error available in all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Define routes
app.use('/', homeRoutes);
app.use('/auth', userRoutes);
app.use('/compare', compareRoutes);
app.use('/pets', petRoutes);
app.use('/about', aboutRoutes);
app.use('/pets/:id/comments', commentRoutes);
app.use('/services', serviceRoutes);
// new
app.use('/services/:id/serviceprovider', serviceProvidersRoutes);

app.use('/regions', locationRoutes);
app.use('/user/profile', userProfileRoutes);
app.use('/user/watchlist', userWatchlistRoutes);
app.use('/user/favorites', userFavouritesRoutes);
app.use('/user/services', userServicesRoutes);
app.use('/user/pets', userPetsRoutes);

// Serve manifest.json
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Serve service-worker.js
app.get('/service-worker.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});

// Serve OneSignalSDKWorker.js
app.get('/OneSignalSDKWorker.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'OneSignalSDKWorker.js'));
});

// app.get('/example', (req, res, next) => {
//   // Throw a custom error
//   const err = new ExpressError('Custom error message', 400);
//   next(err);
// });

// Error handling middleware
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';

  if (!(err instanceof ExpressError)) {
    // If the error is not an instance of ExpressError, create a new instance with default values
    const defaultError = new ExpressError(message, statusCode);
    err = defaultError;
  }

  res.status(err.statusCode).render('error', { err });
});

// Error handling middleware
// app.use((err, req, res, next) => {
//   const { statuscode = 500 } = err;
//   if (!err.message) {
//     err.message = 'Something went wrong!';
//   }
//   res.status(statuscode).render('error', { err });
// });

// Example 1: Handling specific error types differently
// app.use((err, req, res, next) => {
//   if (err instanceof CustomError) {
//     // Handle specific error type differently
//     res.status(400).render('custom-error', { err });
//   } else if (err instanceof AnotherError) {
//     // Handle another specific error type differently
//     res.status(404).render('another-error', { err });
//   } else {
//     // For other errors, use the default error template
//     res.status(500).render('error', { err });
//   }
// });

// Example 2: Logging errors
// app.use((err, req, res, next) => {
//   // Log the error
//   console.error(err);

//   // Render the default error template
//   res.status(500).render('error', { err });
// });

// Example 3: Customizing error message based on the request
// app.use((err, req, res, next) => {
//   let message = 'Something went wrong!';

//   if (req.method === 'POST') {
//     message = 'Error occurred while processing the form submission.';
//   }

//   // Create a new instance of ExpressError with the customized message
//   const customError = new ExpressError(message, 500);

//   // Render the error template
//   res.status(customError.statusCode).render('error', { err: customError });
// });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
