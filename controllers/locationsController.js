const Location = require("../models/location");

// Get a specific region
module.exports.getRegion = async (req, res) => {
  const regionName = req.params.regionName;

  try {
    const region = await Location.findOne({ region: regionName });

    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }

    res.json(region.geometry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new region
module.exports.createRegion = async (req, res) => {
  try {
    const { country, region, geometry } = req.body;

    const location = new Location({
      country,
      region,
      geometry,
    });

    const savedLocation = await location.save();

    res.status(201).json(savedLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create region" });
  }
};
