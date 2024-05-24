const mongoose = require("mongoose"); // Erase if already required
const Schema = mongoose.Schema;

const savedPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Saved Post must belong to a user"],
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "Saved Post must belong to a post"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  {
    timestamps: true,
  }
);

savedPostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "postId",
    select: "-__v",
  });
  next();
});

//Export the model
const SavedPost = mongoose.model("SavedPost", savedPostSchema);

module.exports = SavedPost;