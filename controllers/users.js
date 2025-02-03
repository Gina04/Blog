const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");

  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  //Validar longitud del password en el controlador
  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "Password must be at least 3 characters long and is required.",
    });
  }

  // Validar que el username sea único
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return response.status(400).json({ error: "Username must be unique" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  console.log('Generated passwordHash:', passwordHash)

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
