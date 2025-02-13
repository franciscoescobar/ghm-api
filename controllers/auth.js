const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({email});
        if(!user) {
            const error = new Error("A user with this email could not be found");
            error.statusCode = 401;
            throw error;
        }
        const isEqual =  await bcrypt.compare(password, user.password);
        if(!isEqual) {
            const error = new Error("Wrong user or password");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: user.email, 
            userId: user._id.toString()
        }, 'somesupersecretsecret', { expiresIn: '1h' });

        res.status(200).json({
            token, 
            userId:user._id.toString(),
            login: true,
            role: user.role
        });
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
exports.getUserRole = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if(!user) {
            const error = new Error("A user with this id could not be found");
            error.statusCode = 401;
            throw error;
        }

        res.status(200).json(user.role);
    }
    catch(err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            const error = new Error("Validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const email = req.body.email;
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            role: "user",
            password: hashedPassword
        });
        await user.save();
        res.status(201) 
            .json({message: "User created!", userId: result._id});
    }
    catch (err) {
        console.log(err);
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}