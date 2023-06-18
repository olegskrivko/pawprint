const Pet = require("../models/pet");
const Comment = require("../models/comment");

// Create a new comment
module.exports.createComment = async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findById(id);
    const newComment = new Comment(req.body.comment);

    newComment.author = req.user._id;
    pet.comments.push(newComment);

    await newComment.save();
    await pet.save();

    req.flash("success", "Successfully added a new comment!");
    res.redirect(`/pets/${pet._id}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to add a new comment");
    res.redirect(`/pets/${id}`);
  }
};

// Delete a comment
module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    await Pet.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);

    req.flash("success", "Successfully deleted comment");
    res.redirect(`/pets/${id}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to delete comment");
    res.redirect(`/pets/${id}`);
  }
};
