const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    var params = {Bucket: 'ghm-gallery', Key: `${posts[0].src}`, Expires: 60};
    var url = s3.getSignedUrl('getObject', params);
    console.log('The URL is', url); // expires in 60 seconds
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const src = req.file.location;
  const name = req.body.name;
  const tags = JSON.parse(req.body.tags);
  const post = new Post({
    name,
    src,
    tags
  });
  try {
    // const user = User.findById(req.userId);
    // if (user.role !== "admin") {
    //   const error = new Error("You are not an administrator");
    //   error.statusCode = 401;
    //   throw error;
    // }
    await post.save();
    res.status(201).json({
      message: "Post created successfully!",
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.editPost = (req, res, next) => {};
exports.deletePost = (req, res, next) => {};
