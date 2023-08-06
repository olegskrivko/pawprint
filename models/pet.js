const mongoose = require('mongoose');
const Comment = require('./comment');

const imageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});
// set thumbnail img size
imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('upload', '/upload/w_200');
});

const petSchema = new mongoose.Schema(
  {
    title: String,
    images: [imageSchema],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        index: '2dsphere', // Create a geospatial index
      },
    },

    identifier: Number,
    description: String,
    species: String,
    breed: String,
    pattern: String,
    color: [
      {
        type: String,
      },
    ],
    coat: String,
    size: String,
    age: String,
    gender: String,
    petStatus: String,
    lostdate: Date,
    // markings: {
    //   blaze: { type: Boolean, default: false },
    //   mask: { type: Boolean, default: false },
    //   socks: { type: Boolean, default: false },
    //   chestSpot: { type: Boolean, default: false },
    //   bellySpot: { type: Boolean, default: false },
    //   collar: { type: Boolean, default: false },
    //   tailTip: { type: Boolean, default: false },
    // },
    views: { type: Number, default: 0 }, // View count field
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true },
);

petSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comments,
      },
    });
  }
});

module.exports = mongoose.model('Pet', petSchema);
