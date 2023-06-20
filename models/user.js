const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userAvatarSchema = new mongoose.Schema({
  url: String,
  filename: String,
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    city: String,
    country: String,
    postalCode: String,
  },
  avatar: [userAvatarSchema],
  phoneNumber: {
    type: String,
  },
  phoneCode: {
    type: String,
  },
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  receiveNotifications: {
    type: Boolean,
    default: true,
  },
  notificationDistance: {
    type: Number,
    default: 25, // Default distance in kilometers
  },
  receiveUpdates: {
    type: Boolean,
    default: true,
  },
  watchlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    address: String,
  },
  language: {
    type: String,
    enum: ["en", "lv", "ru", "et", "lt"], // List of supported languages
    default: "en", // Default language (e.g., English)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

// Check GDPR what data I can store how long etc (location)
