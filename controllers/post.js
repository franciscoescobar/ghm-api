const Post = require("../models/post");
const User = require("../models/user");

const { validationResult } = require("express-validator");

const getDownloadUrl = require("../utils/preSignedUrl");
const {reduceQuality, addWatermark} = require("../utils/processImage");

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
        // const newUrl = await getDownloadUrl(post.src);
        // const newLowUrl = await getDownloadUrl(post.lowSrc);
        // const newWatermarkUrl = await getDownloadUrl(post.waterkmarkSrc);
        // post.signedLowSrc = newLowUrl;
        // post.signedSrc = newUrl;
        // post.signedWaterkmarkSrc = newWatermarkUrl;
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
exports.getFilteredPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  const categoriesIds = req.body.map(category => {
    return category._id;
  });

  try {
    let totalItems;
    let posts;
    if(categoriesIds.length > 0){
      totalItems = await Post.find({ tags: {$all: categoriesIds }}).countDocuments();
      posts = await Post.find( { tags: {$all: categoriesIds }} )
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }
    else {
      totalItems = await Post.find().countDocuments();
      posts = await Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    }
    const newPosts = await Promise.all(
      posts.map(async post => {
        const newUrl = await getDownloadUrl(post.src);
        const newLowUrl = await getDownloadUrl(post.lowSrc);
        // const newWatermarkUrl = await getDownloadUrl(post.waterkmarkSrc);
        post.signedLowSrc = newLowUrl;
        post.signedSrc = newUrl;
        // post.signedWaterkmarkSrc = newWatermarkUrl;
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
  const name = req.body.name;
  const tags = JSON.parse(req.body.tags);
  const src = req.file.location;
  const newUrl = await getDownloadUrl(src);
  const lowSrc = await reduceQuality(newUrl, req.file.key);
  const waterkmarkSrc = await addWatermark(newUrl, req.file.key);
  const newLowSrc = await getDownloadUrl(lowSrc);
  const signedWaterkmarkSrc = await getDownloadUrl(waterkmarkSrc);

  const post = new Post({
    name,
    src: src,
    signedSrc: newUrl,
    lowSrc: lowSrc,
    signedLowSrc: newLowSrc,
    waterkmarkSrc: waterkmarkSrc,
    signedWaterkmarkSrc: signedWaterkmarkSrc,
    tags
  });
  try {
    // const user = await User.findById(req.body.userId);
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
exports.editPost = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;  
  }
  const postId = req.body.postId;
  const name = req.body.name;
  const tags = JSON.parse(req.body.tags);
  const src = req.file.location;

  try {
    const post = Post.findById(postId);
    if(!post) {
      const error = new Error('Could not found post')
      error.statusCode = 404;
      throw error;
    }
    const newUrl = await getDownloadUrl(src);
    const lowSrc = await reduceQuality(newUrl, req.file.key);
    const waterkmarkSrc = await addWatermark(newUrl, req.file.key);
    const newLowSrc = await getDownloadUrl(lowSrc);
    const signedWaterkmarkSrc = await getDownloadUrl(waterkmarkSrc);
    post.name = name;
    post.src = src;
    post.signedSrc = newUrl;
    post.lowSrc = lowSrc;
    post.signedLowSrc = newLowSrc;
    post.waterkmarkSrc = waterkmarkSrc;
    post.signedWaterkmarkSrc = signedWaterkmarkSrc;
    post.tags = tags;
    
    await post.save();
    res.status(200).json(
      {
        message: "Category updated", 
        post
      }
    );
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
exports.deletePost = async(req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;  
  }
  const postId = req.body.postId;
  try {
    const post = Post.findById(postId);
    if(!post) {
      const error = new Error('Could not found post')
      error.statusCode = 404;
      throw error;
    }
    await Post.findByIdAndRemove(postId);
    res.status(200).json(
      {
        message: "Post deleted successfully"
      }
    );
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
