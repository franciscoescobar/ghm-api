const express = require("express");
const postController = require("../controllers/post");
const { upload } = require("../middlewares/aws-upload");
const isAuth = require("../middlewares/is-auth");
const { check, validationResult } = require('express-validator');

const router = express.Router();

router.get("/posts", postController.getPosts);
  
router.post("/post",upload.single('image'), postController.createPost);

router.patch("/post/:postId", postController.editPost);

router.delete("/post/:postId", postController.deletePost);

module.exports = router;
