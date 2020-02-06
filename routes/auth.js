const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();

router.post('/login', authController.login);
router.put('/signup', authController.signup);

module.exports = router;