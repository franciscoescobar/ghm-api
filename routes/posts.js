const express = require("express");
const postController = require("../controllers/post");
const awsUpload = require("../utils/aws-upload");

const router = express.Router();

router.get("/posts", postController.getPosts);
router.post("/post", awsUpload, postController.createPost);
router.patch("/post/:postId", postController.editPost);
router.delete("/post/:postId", postController.deletePost);

module.exports = router;
