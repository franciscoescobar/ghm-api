const Post = require("../models/post");
const User = require("../models/user");
const aws = require("aws-sdk");
aws.config.update({
  secretAccessKey: "NCGPXTsAlkUT90ccFXPVGzjFFE7Vkx8L4A1NFmiI",
  accessKeyId: "AKIAZETXKKH3ZBTGVMOJ",
  region: "us-east-2"
});

const s3 = new aws.S3({});
const { validationResult } = require("express-validator");

const getDownloadUrl = require("../utils/preSignedUrl");
const { reduceQuality, addWatermark } = require("../utils/processImage");

exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 20;
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .skip((Number(currentPage) - 1) * perPage)
      .limit(perPage);

    const newPosts = await Promise.all(
        posts.map(async post => {
          const newLowUrl = await getDownloadUrl(post.lowSrc);
          post.signedLowSrc = newLowUrl;
          return post;
        })
      );
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: newPosts,
      totalItems,
      page: Number(currentPage)
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if(!post) {
      const error = new Error('Could not found post')
      error.statusCode = 404;
      throw error;
    }
    const newLowUrl = await getDownloadUrl(post.lowSrc);
    const newUrl = await getDownloadUrl(post.src);
    const newWatermarkUrl = await getDownloadUrl(post.watermarkSrc);
    
    post.signedLowSrc = newLowUrl;
    post.signedSrc = newUrl;
    post.signedWatermarkSrc = newWatermarkUrl;
    res.status(200)
      .json({
        message: "Post Fetched",
        post
      })
  }
  catch(err){
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
}
exports.getFilteredPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 20;
    const searchInput = req.body.searchInput;
    console.log(searchInput)
    if(searchInput.length < 3) {
      const error = new Error('Search need more than 3 characters');
      error.statusCode = 404;
      throw error;
    }
    else {
      
      const posts = await Post.aggregate([{
        $match: 
          {
            $or: 
            [
              { 
                name: 
                {
                  $regex: searchInput,
                }
              },
              { 
                email: 
                {
                  $regex: searchInput,
                }
              },
              {
                categories:
                {
                  name: searchInput
                }
              }
            ]
          }
        }])
        .skip((Number(currentPage) - 1) * perPage)
        .limit(perPage);
      if(posts.length === 0) {
        const error = new Error("Could not found any post")
        error.statusCode = 404;
        throw error;
      }
      const newPosts = await Promise.all(
          posts.map(async post => {
            const newLowUrl = await getDownloadUrl(post.lowSrc);
            post.signedLowSrc = newLowUrl;
            return post;
          })
        );
      res.status(200).json({
        posts: newPosts,
        totalItems: posts.length,
        page: Number(currentPage)
      });
    }
  }
  catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
exports.createPost = async (req, res, next) => {  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect");
      error.statusCode = 422;
      throw error;
    }
    if (!req.files) {
      const error = new Error("No images provided or the images provided are not a jpg, jpeg, png or gif");
      error.statusCode = 422;
      throw error;
    }
    const name = req.body.name;
    const categories = JSON.parse(req.body.categories);
    let posts = [];
    const uploadPost = async (file) => {
      const src = file.location;
      const size = file.size
      const sizeInMB = (size / (1024*1024)).toFixed(2);
      const newUrl = await getDownloadUrl(src);
      const lowSrc = await reduceQuality(newUrl, file.key);
      const watermarkSrc = await addWatermark(newUrl, file.key);
      const newLowSrc = await getDownloadUrl(lowSrc);
      const post = new Post({
        name,
        categories,
        src: src,
        signedSrc: newUrl,
        lowSrc: lowSrc,
        signedLowSrc: newLowSrc,
        watermarkSrc: watermarkSrc,
        size: sizeInMB
      });
      posts.push(post);
      await post.save();
    }
    
    Promise.all(
      req.files.map(file => uploadPost(file))
      )
      .then(result => {
        res.status(201).json({
          message: "Post created successfully!",
          post: posts
        });
      })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.editPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const name = req.body.name;
  const tags = JSON.parse(req.body.tags);
  try {
    await Post.findById(postId, async (err, doc) => {
      if (err) {
        const error = new Error("Could not found post");
        error.statusCode = 404;
        throw error;
      }
      doc.name = name;
      doc.tags = tags;
      if(req.file !== doc.file){
        const src = req.file.location;
        const size = req.file.size;
        const sizeInMB = (size / (1024*1024)).toFixed(2);
        const newUrl = await getDownloadUrl(src);
        const lowSrc = await reduceQuality(newUrl, req.file.key);
        const watermarkSrc = await addWatermark(newUrl, req.file.key);
        const newLowSrc = await getDownloadUrl(lowSrc);
        const signedWatermarkSrc = await getDownloadUrl(watermarkSrc);
        doc.src = src;
        doc.signedSrc = newUrl;
        doc.lowSrc = lowSrc;
        doc.signedLowSrc = newLowSrc;
        doc.watermarkSrc = watermarkSrc;
        doc.signedWatermarkSrc = signedWatermarkSrc;
        doc.size = sizeInMB;
        deleteImageFromS3(doc.src);
      }
      else {
        const newUrl = await getDownloadUrl(doc.src);
        const newLowSrc = await getDownloadUrl(doc.lowSrc);
        const signedWatermarkSrc = await getDownloadUrl(doc.watermarkSrc);
        doc.signedSrc = newUrl;
        doc.signedLowSrc = newLowSrc;
        doc.signedWatermarkSrc = signedWatermarkSrc;
      }
      await doc.save();
      res.status(200).json({
        message: "Category updated",
        doc
      });
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
exports.deletePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not found post");
      error.statusCode = 404;
      throw error;
    }
    deleteImageFromS3(post.src);
    await Post.findByIdAndRemove(postId);
    res.status(200).json({
      message: "Post deleted successfully"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
};
const deleteImageFromS3 = (key) => {
  const realKey = key.split('.com/')[1];
  s3.deleteObjects({
    Bucket: 'ghm-gallery',
    Delete: {
      Objects: [
        {Key: realKey},
        {Key: `low-${realKey}`},
        {Key: `water-${realKey}`}
      ],
      Quiet: false
    }
  }, (err, data) =>{ 
    if (err)
    console.log(err);
  });
}