const mongoose = require("mongoose"); // Erase if already required
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide your post title"],
    },
    price: {
      type: Number,
      required: [true, "Please provide your post price"],
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    images: {
      type: [String],
      required: [true, "Please provide your post images"],
    },
    address: {
      type: String,
      required: [true, "Please provide your address"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Please provide number of bedrooms"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Please provide number of bathroom"],
    },
    kitchens: {
      type: Number,
      required: [true, "Please provide number of kitchen"],
    },
    parking: {
      type: String,
      required: [true, "Please provide number of parking"],
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "rent"],
      required: [true, "Please define the service type"],
    },
    property: {
      type: String,
      enum: ["apartment", "house", "condo", "land"],
      required: [true, "Please define the property type"],
    },
    description: {
      type: String,
      required: [true, "Please, enter your description"],
    },
    utilities: {
      type: String,
      required: [true, "Please, enter your utilities"],
    },
    pet: {
      type: String,
      required: [true, "Please, enter your pet"],
    },
    size: {
      type: Number,
      required: [true, "Please, enter your size"],
    },
    nearBySchool: {
      type: String,
      required: [true, "Please, enter your school"],
    },
    nearByBusStation: {
      type: String,
      required: [true, "Please, enter your bus stop "],
    },
    nearByRestaurant: {
      type: String,
      required: [true, "Please, enter your restaurant"],
    },
    nearBySupermarket: {
      type: String,
      required: [true, "Please, enter your supermarket"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    authorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Post must belong to a user"],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: false,
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

// postSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "authorId",
//     selected: "title price images address",
//   });

//   next();
// });

//Export the model

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
