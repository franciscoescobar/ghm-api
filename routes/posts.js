const express = require("express");
const postController = require("../controllers/post");
const upload = require("../utils/aws-upload");

const router = express.Router();

router.get("/posts", postController.getPosts);
router.post("/post",upload.single('image'), postController.createPost);
router.patch("/post/:postId", postController.editPost);
router.delete("/post/:postId", postController.deletePost);

module.exports = router;
