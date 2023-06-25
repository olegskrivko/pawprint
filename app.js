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
//const i18n = require('i18n');

// Import middleware and utility
//const { languageMiddleware } = require('./middleware/middleware');
const ExpressError = require('./utils/ExpressError');

// Import routes
const userRoutes = require('./routes/userRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const petRoutes = require('./routes/petRoutes');
const compareRoutes = require('./routes/compareRoutes');
const commentRoutes = require('./routes/commentRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Import locales
const enData = require('./locales/en.json');
const lvData = require('./locales/lv.json');

// Import model
const User = require('./models/user');

// Create Express app
const app = express();

// Configure i18n middleware
// i18n.configure({
//   locales: ['en', 'lv'],
//   defaultLocale: 'en',
//   directory: __dirname + '/locales',
//   queryParameter: 'lang',
//   cookie: 'lang',
//   register: global,
// });
// app.use(i18n.init);
//   "mongoose": "^6.8.4",
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

// Set the value of strictQuery explicitly (no longer necessary in recent versions of Mongoose)

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

// Set up Express app
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(express.json());
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
app.use('/auth', userRoutes);
app.use('/compare', compareRoutes);
app.use('/pets', petRoutes);
app.use('/about', aboutRoutes);
app.use('/pets/:id/comments', commentRoutes);
app.use('/services', serviceRoutes);
app.use('/regions', locationRoutes);

// Home route
app.get('/', async (req, res) => {
  try {
    let userLanguage;

    if (req.isAuthenticated()) {
      // User is logged in, retrieve language preference from user profile
      const user = await User.findById(req.user.id);
      userLanguage = user.language;
    } else {
      // User is not logged in, retrieve language preference from request headers
      userLanguage = req.headers['accept-language'];
    }

    // Retrieve the corresponding data based on the user's language preference
    const data = userLanguage && userLanguage.startsWith('lv') ? lvData : enData;
    res.render('home', { data });
  } catch (err) {
    console.error(err.message);
    // Handle the error or redirect to an appropriate error page
    res.redirect('/error');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statuscode = 500 } = err;
  if (!err.message) {
    err.message = 'Something went wrong!';
  }
  res.status(statuscode).render('error', { err });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
