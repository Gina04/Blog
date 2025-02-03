const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require("mongoose")
const middleware = require("./utils/middleware")

mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());
// Registrar el tokenExtractor
app.use(middleware.tokenExtractor);

// usa el middleware en todas las rutas
//app.use(middleware.userExtractor)

// usa el middleware solo en las rutas de api/blogs
//saco el middleware.userExtractor para poder hacer las pruebas en los test
app.use("/api/blogs", middleware.userExtractor, blogsRouter);
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

module.exports = app;
