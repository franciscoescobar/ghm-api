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
    const category = new Category({
      name: req.body.name,
      selected: req.body.selected
    });
    console.log(category);
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
exports.editCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;  
  }
  const categoryId = req.body.categoryId;
  const categoryName = req.body.name;
  try {
    const category = Category.findById(categoryId);
    if(!category) {
      const error = new Error('Could not found category')
      error.statusCode = 404;
      throw error;
    }
    category.name = categoryName;
    await category.save();
    res.status(200).json(
      {
        message: "Category updated", 
        category
      }
    );
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }   
}
exports.deleteCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;  
  }
  const categoryId = req.body.categoryId;
  try {
    const category = Category.findById(categoryId);
    if(!category) {
      const error = new Error('Could not found category')
      error.statusCode = 404;
      throw error;
    }
    await Category.findByIdAndRemove(categoryId);;
    res.status(200).json(
      {
        message: "Category deleted successfully"
      }
    );
  } catch (err) {
    if(!err.statusCode) {
      err.statusCode = 500;
    }
    next();
  }
}