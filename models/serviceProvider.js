const mongoose = require("mongoose");

const serviceLogoSchema = new mongoose.Schema({
  url: String,
  filename: String,
});

const ServiceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  serviceProviderType: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  logo: [serviceLogoSchema],
  email: {
    type: String,
  },
  phonecode: {
    type: String,
  },
  phone: {
    type: String,
  },
  socialMedia: {
    facebook: {
      type: String,
    },
    instagram: {
      type: String,
    },
    // Other social media fields (e.g., twitter etc.) can be added here
  },
  serviceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  website: {
    type: String,
  },
  // availability: {
  //   type: String,
  // },
});

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  ServiceProviderSchema
);

module.exports = ServiceProvider;
