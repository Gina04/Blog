const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require("mongoose");

mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

module.exports = app;
