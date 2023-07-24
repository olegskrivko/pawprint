const Pet = require('../models/pet');
const Comment = require('../models/comment');

// Create a new comment
module.exports.createComment = async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findById(id); // Find the pet by its ID

    // Create a new comment with the provided body and location
    // console.log(req.body.comment);
    // const newComment = new Comment({
    //   body: req.body.comment.body,
    //   location: {
    //     type: 'Point',
    //     coordinates: [req.body.comment.lng, req.body.comment.lat],
    //   },
    // });
    // Check if latitude and longitude are provided in req.body.comment
    const { body, lat, lng } = req.body.comment;
    const newComment = new Comment({
      body: body,
    });

    // Add the location if both latitude and longitude are provided
    if (lat && lng) {
      newComment.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    newComment.author = req.user._id; // Set the author of the comment as the current user

    pet.comments.push(newComment); // Add the new comment to the pet's comments array

    await newComment.save(); // Save the new comment
    await pet.save(); // Save the updated pet document

    req.flash('success', 'Successfully added a new comment!');
    res.redirect(`/pets/${pet._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to add a new comment');
    res.redirect(`/pets/${id}`);
  }
};

// Delete a comment
module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    await Pet.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);

    req.flash('success', 'Successfully deleted comment');
    res.redirect(`/pets/${id}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete comment');
    res.redirect(`/pets/${id}`);
  }
};
