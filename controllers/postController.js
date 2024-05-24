const Post = require("./../models/postModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid");

// multer configuration for uploading product photo
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images file", 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostImages = upload.fields([{ name: "images", maxCount: 5 }]);
upload.array("images", 5);



exports.resizePostImages = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      let filename;
      if (req.params.id) {
        filename = `updated-products-${req.params.id}-${Date.now()}-${
          i + 1
        }}.jpeg`;
        console.log("req.body.images Lin 47:", req.body.images);
      } else {
        filename = `new-products-${uuid.v4()}-${Date.now()}-${i + 1}}.jpeg`;
      }

      await sharp(file.buffer)
        .resize(950, 950)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/post/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const aPost = await Post.findById(postId).populate("authorId");

  res.status(200).json({
    status: "success",
    data: {
      aPost,
    },
  });
});

exports.getPosts = catchAsync(async (req, res, next) => {
  const { city, type, property, minPrice, maxPrice, bedroom } = req.query;

  let queryObj = {};

  if (city) queryObj.city = city;
  if (type) queryObj.type = type;
  if (property) queryObj.property = property;
  if (bedroom) {
    const bedroomInt = parseInt(bedroom, 10);
    if (!isNaN(bedroomInt)) queryObj.bedroom = bedroomInt;
  }

  if (minPrice || maxPrice) {
    queryObj.price = {};
    const minPriceInt = parseInt(minPrice, 10);
    const maxPriceInt = parseInt(maxPrice, 10);
    if (!isNaN(minPriceInt)) queryObj.price.$gte = minPriceInt;
    if (!isNaN(maxPriceInt)) queryObj.price.$lte = maxPriceInt;
  }
  const hasNoQuery = Object.keys(req.query).length === 0;

  const allPosts = hasNoQuery ? await Post.find() : await Post.find(queryObj);

  res.status(200).json({
    status: "success",
    result: allPosts.length,
    data: {
      posts: allPosts,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { postId } = req.params;
  const findPost = await Post.findById(postId);

  if (!findPost) {
    return next(new AppError("Post not found", 404));
  }

  if (findPost.authorId.toString() !== userId) {
    return next(
      new AppError("You are not authorized to delete this post,", 403)
    );
  }
  await Post.findByIdAndDelete(postId);
  res.status(204).json({
    status: "Post Deleted",
    data: null,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;
  const { postId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.authorId.toString() !== userId) {
    return next(
      new AppError("You are not authorized to update this post", 403)
    );
  }

  post.title = req.body.title;
  post.price = req.body.price;
  post.images = req.body.images;
  post.address = req.body.address;
  post.city = req.body.city;
  post.bedroom = req.body.bedroom;
  post.bathroom = req.body.bathroom;
  post.locations = req.body.locations;
  post.type = req.body.type;
  post.property = req.body.property;
  post.authorId = userId;

  post.updatedAt = new Date();
  const updatedPost = await post.save();

  res.status(200).json({
    status: "Post Updated",
    data: updatedPost,
  });
});

exports.addPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    title: req.body.title,
    price: req.body.price,
    images: req.body.images,
    description: req.body.description,
    bedroom: req.body.bedroom,
    bathroom: req.body.bathroom,
    kitchen: req.body.kitchen,
    parking: req.body.parking,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    address: req.body.address,
    type: req.body.type,
    property: req.body.property,
    city: req.body.city,
    utilities: req.body.utilities,
    country: req.body.country,
    pet: req.body.pet,
    income: req.body.income,
    size: req.body.size,
    school: req.body.school,
    bus: req.body.bus,
    restaurant: req.body.restaurant,
    supermarket: req.body.supermarket,
    authorId: req.user.id,
  });

  res.status(201).json({
    status: "Added new post",
    data: {
      newPost,
    },
  });
});

