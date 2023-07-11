const mongoose = require('mongoose');
const fns = require('date-fns');

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

commentSchema.post('find', function (docs) {
  // Convert timestamps to a different data format for each comment
  for (let doc of docs) {
    if (doc.createdAt) {
      const formattedCreatedAt = fns.formatDistanceToNow(new Date(doc.createdAt), {
        addSuffix: true,
      });
      // Convert createdAt timestamp to a different data format
      //const formattedCreatedAt = doc.createdAt.toISOString(); // Example: Convert to ISO string
      doc.formattedCreatedAt = formattedCreatedAt; // Add formatted timestamp to the document
    }

    // Add more conversion logic for other timestamp fields if needed
  }
});

module.exports = mongoose.model('Comment', commentSchema);
