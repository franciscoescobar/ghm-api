const express = require("express");
const categoryController = require("../controllers/category");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.get('/category', categoryController.getCategories);
router.post('/category', categoryController.createCategory);
router.patch('/category/:categoryId', categoryController.editCategory);
router.delete('/category/:categoryId', categoryController.deleteCategory);

module.exports = router;