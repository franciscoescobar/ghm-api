const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const categoriesRoutes = require("./routes/categories");

const port = process.env.PORT || 8080; // set the port

const app = express();

// app.use(bodyParser.urlencoded({extended: false})); // x-www-form-urlencoded <form>
app.use(helmet());
app.use(bodyParser.json()); // application/json

app.use(cors());
app.use(
  "/exported-images",
  express.static(path.join(__dirname, "images-lowres"))
);

app.use(authRoutes);
app.use(postsRoutes);
app.use(categoriesRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});
mongoose
  .connect(
    "mongodb+srv://fran:fran937164@cluster0-xdxd0.mongodb.net/ghm-gallery?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
  .then(result => {
    app.listen(port);
  })
  .catch(err => console.log(err));
