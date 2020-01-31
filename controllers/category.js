const Category = require("../models/category");
const { validationResult } = require("express-validator");

exports.getCategories = async (req, res, next) => {
    try {
      const categories = await Category.find();
      res.status(200).json({
        message: "Posts fetched successfully",
        categories
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next();
    }
}
exports.createCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        error.statusCode = 422;
        throw error;
    }
    const category = new Category();
    category.name = req.body.name;
    try {
        // const user = User.findById(req.userId);
        // if (user.role !== "admin") {
        //   const error = new Error("You are not an administrator");
        //   error.statusCode = 401;
        //   throw error;
        // }
        await category.save();
        res.status(201).json({
            message: "Post created successfully!",
            category
        });
    } catch (err) {
        if (!err.statusCode) {
        err.statusCode = 500;
        }
        next(err);
    }
}
exports.editCategory = (req, res, next) => {
    
}
exports.deleteCategory = (req, res, next) => {
    
}