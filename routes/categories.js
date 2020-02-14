const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/category");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.get('/category', categoryController.getCategories);

router.post('/category', [
    body("name").isLength({ min: 3})
], categoryController.createCategory);

router.patch('/category/:categoryName/:categoryId', [
    body("name").isLength({ min: 3})
], categoryController.editCategory);

router.delete('/category/:categoryId', categoryController.deleteCategory);

module.exports = router;