const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const categoriesRoutes = require("./routes/categories");

const app = express();

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(authRoutes);
app.use(postsRoutes);
app.use(categoriesRoutes);

mongoose
    .connect(
        'mongodb+srv://fran:fran937164@cluster0-xdxd0.mongodb.net/ghm?retryWrites=true&w=majority'
    )
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err))
