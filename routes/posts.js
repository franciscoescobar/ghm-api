const express = require("express");
const postController = require("../controllers/post");

const router = express.Router();

router.get('/post', postController.getPosts);
router.post('/post', postController.createPost);
router.patch('/post/:postId', postController.editPost);
router.delete('/post/:postId', postController.deletePost);

module.exports = router;