const express = require("express");
const postController = require("../controllers/post");
const { upload } = require("../middlewares/aws-upload");
const isAuth = require("../middlewares/is-auth");
const { body } = require('express-validator');

const router = express.Router();

router.get("/posts", postController.getPosts);

router.get("/post/:postId", postController.getPost);

router.put("/posts", postController.getFilteredPosts);
  
router.post("/post", [isAuth, upload.array('image', 20)], postController.createPost);

router.patch("/post/:postId", [isAuth, upload.array('image')], postController.editPost);

router.delete("/post/:postId", isAuth , postController.deletePost);

module.exports = router;
