const mongoose = require("mongoose");

// Define the location schema
const locationSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ["Polygon"],
      default: "Polygon",
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
});

// Create the Location model using the location schema
const Location = mongoose.model("Location", locationSchema);

// Export the Location model
module.exports = Location;
