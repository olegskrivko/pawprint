if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const i18n = require("i18n");
const { languageMiddleware } = require("./middleware/middleware");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");

// routes
const userRoutes = require("./routes/userRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const petRoutes = require("./routes/petRoutes");
const commentRoutes = require("./routes/commentRoutes");
const locationRoutes = require("./routes/locationRoutes");

// const favicon = require("serve-favicon");
const MongoStore = require("connect-mongo");
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/pet-finder";
// const dbURL = "mongodb://localhost:27017/pet-finder";

mongoose.connect(dbURL, () => {
  console.log("Conected to DB!");
});

// Set the value of strictQuery explicitly
mongoose.set("strictQuery", false);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected!");
});

const app = express();

// Middleware
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
// app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
app.use(mongoSanitize());

// Configure i18n middleware
i18n.configure({
  locales: ["en", "lv"],
  defaultLocale: "en",
  directory: __dirname + "/locales",
  queryParameter: "lang",
  cookie: "lang",
  register: global,
});
app.use(i18n.init);

const secret = process.env.SECRET;
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: "session",
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
app.use(express.json());
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Add the language middleware after the session middleware
// app.use(languageMiddleware);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes petRoutes userRoutes

app.use("/auth", userRoutes);
app.use("/pets", petRoutes);
app.use("/about", aboutRoutes);
app.use("/pets/:id/comments", commentRoutes);
app.use("/services", serviceRoutes);
app.use("/regions", locationRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  // next(new ExpressError("Page Not Found", 404));
  res.render("pagenotfound");
});

app.use((err, req, res, next) => {
  const { statuscode = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong!";
  }
  res.status(statuscode).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
