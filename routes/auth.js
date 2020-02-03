const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();

router.post('/login', authController.login);
router.put('/signup',[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req}) => {
            return User.findOne({email: value}).then(userDoc => {
                if(userDoc) {
                    return Promise.reject('E-mail address already exists!');
                }
            })
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength( {min:5} )
], authController.signup);

module.exports = router;