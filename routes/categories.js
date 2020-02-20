const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/category");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.get('/category', categoryController.getCategories);

router.post('/category', [
    isAuth,
    body("name").isLength({ min: 3})
], categoryController.createCategory);

router.patch('/category/:categoryName/:categoryId', isAuth, categoryController.editCategory);

router.delete('/category/:categoryId', isAuth, categoryController.deleteCategory);

module.exports = router;