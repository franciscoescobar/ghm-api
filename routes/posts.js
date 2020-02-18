const express = require("express");
const postController = require("../controllers/post");
const { upload } = require("../middlewares/aws-upload");
const isAuth = require("../middlewares/is-auth");
const { body } = require('express-validator');

const router = express.Router();

router.get("/posts", postController.getPosts);

router.get("/post/:postId", postController.getPost);

router.put("/posts", postController.getFilteredPosts);
  
router.post("/post", upload.single('image'), postController.createPost);

router.patch("/post/:postId", upload.single('image'), postController.editPost);

router.delete("/post/:postId", postController.deletePost);

module.exports = router;
