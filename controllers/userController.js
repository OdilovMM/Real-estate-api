const User = require("./../models/userModel");
const Post = require("./../models/postModel");
const SavedPost = require("./../models/savedPostModel.js");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { ObjectId } = require("mongoose").Types;
const multer = require("multer");
const sharp = require("sharp");

// defining multer storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images/users");
//   },
//   filename: (req, file, cb) => {
//     // defining filename
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

// defining multer filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image uploadable!", 400), false);
  }
};

// upload function
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("avatar");

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("There is no user registered with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "firstName",
    "lastName"
  );
  if (req.file) filteredBody.avatar = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "Updated",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "Deleted Successfully",
    data: null,
  });
});

exports.profilePosts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const savedPostsList = await SavedPost.find({
    authorId: new ObjectId(userId),
  }).populate({ path: "savedposts", options: { strictPopulate: false } });

  const user = await User.findById(userId)
    .populate("posts")
    .populate("savedposts");
  if (!user) {
    return next(new AppError("There is no user registered with that ID", 404));
  }
  res.status(200).json({
    posts: user.posts.length,
    savedPosts: savedPostsList.length,
    posts: user.posts,
    savedPostsList,
  });
});

exports.savePost = async (req, res, next) => {
  const { postId } = req.body;
  const { id } = req.user;
  console.log(req.body);

  const post = await Post.findById(postId);

  if (post.authorId.toString() === req.user.id) {
    return next(new AppError("You cannot save your own post", 400));
  }

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  try {
    const savedPost = await SavedPost.findOne({
      $and: [
        {
          postId: {
            $eq: postId,
          },
        },
        {
          authorId: {
            $eq: id,
          },
        },
      ],
    });

    if (savedPost) {
      await SavedPost.findByIdAndDelete(savedPost._id);
      res.status(200).json({
        status: "success",
        message: "Post unsaved",
      });
    } else {
      const savedPost = await SavedPost.create({
        authorId: id,
        postId: postId,
      });
      res.status(201).json({
        status: "Post Saved",
        message: "Post saved",
        data: savedPost,
        isSaved: savedPost ? true : false,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
};

exports.getSavedPosts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const savedPostsList = await SavedPost.find({
    authorId: new ObjectId(userId),
  }).populate({ path: "savedposts", options: { strictPopulate: false } });

  res.status(200).json({
    status: "success",
    result: savedPostsList.length,
    data: savedPostsList,
  });
});