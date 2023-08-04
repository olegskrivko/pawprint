const Service = require('../models/service');
const ServiceProvider = require('../models/serviceProvider');
const User = require('../models/user');

module.exports.renderServiceProvider = async (req, res) => {
  const { slug, serviceProviderId } = req.params;

  try {
    const service = await Service.findOne({ slug });
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    // const { body, lat, lng } = req.body.comment;
    // const newComment = new Comment({
    //   body: body,
    // });

    // Add the location if both latitude and longitude are provided
    // if (lat && lng) {
    //   newComment.location = {
    //     type: 'Point',
    //     coordinates: [lng, lat],
    //   };
    // }

    //newComment.author = req.user._id; // Set the author of the comment as the current user
    //pet.comments.push(newComment); // Add the new comment to the pet's comments array

    //await newComment.save(); // Save the new comment
    //await pet.save(); // Save the updated pet document

    //req.flash('success', 'Successfully added a new comment!!!');
    res.render(`services/serviceProvider`, { service, serviceProvider });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to add a new comment');
    res.redirect(`/`);
  }
};
