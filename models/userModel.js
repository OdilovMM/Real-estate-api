const mongoose = require("mongoose"); // Erase if already required
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Please provide your email"],
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Please provide your username"],
    },
    firstName: {
      type: String,
      required: [true, "Please provide your username"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your username"],
    },
    password: {
      type: String,
      required: true,
      required: [true, "Please provide a password"],
      select: false,
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
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

// Parent relationship virtual populate
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "authorId",
  localField: "_id",
});
userSchema.virtual("savedposts", {
  ref: "Post",
  foreignField: "authorId",
  localField: "_id",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.addPost = async function (postId) {
  this.posts.push(postId);
  await this.save();
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Export the model
const User = mongoose.model("User", userSchema);

module.exports = User;
