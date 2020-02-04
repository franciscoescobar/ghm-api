const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const getDownloadUrl = require("../utils/preSignedUrl");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;

  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    const newPosts = await Promise.all(
      posts.map(async post => {
        const newUrl = await getDownloadUrl(post.src);
        post.src = newUrl;
        return post;
      })
    );
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: newPosts,
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
