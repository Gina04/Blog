const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("assert");
const api = supertest(app);
const Blog = require("../models/blog");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const helper = require("./test_helper");

beforeEach(async () => {
  await Blog.deleteMany({}); // Limpia la base de datos de prueba antes de cada test
  await User.deleteMany({}); // Limpia la coleecion de usuario

  // Crear un usuario de prueba con passwordHash
  const saltRounds = 10;
  const password = 'alex';
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username: 'Alex',
    name : 'Alexander',
    // Si tu modelo tiene otros campos como 'name', inclúyelos
    passwordHash,
  });

  await user.save();

  //Crear algunos blogs para las pruebas
  const blog1 = new Blog({
    title: "Ciberseguridad Google",
    content: "Ciberseguridad Google",
    author: "Author 1",
  });

  const blog2 = new Blog({
    title: "Test Blog 2",
    content: "Otro contenido",
    author: "Author 2",
  });

  await blog1.save();
  await blog2.save();
});

test("a valid user can register", async () => {
  const newUser = {
    username: "JohnDoe",
    password: "john123",
  };

  await api
    .post("/api/users")
    .send(newUser)
    .expect(201) // Verificar que la respuesta es 201(Creado)
    .expect("Content-Type", /application\/json/);

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 2);
  const usernames = usersAtEnd.map((u) => u.username);
  assert(usernames.includes("JohnDoe"));
});

test("user login returns a token", async () => {
  const loginCredentials = {
    username: "Alex",
    password: "alex",
  };

  const response = await api
    .post("/api/login")
    .send(loginCredentials)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert(response.body.token);
  assert.strictEqual(response.body.username, "Alex");
});

test("Creating a blog works with a valid token", async () => {
  const loginCredentials = {
    username: "Alex",
    password: "alex",
  };

  const loginResponse = await api
    .post("/api/login")
    .send(loginCredentials)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const token = loginResponse.body.token;

  const newBlog = {
    title: "Fueron momentos más felices en mi vida",
    content: "Contenido del blog",
    author: "Ginita",
    url: "http://example.com/registrar-usuario-loguearse",
    likes: 0,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  // Realizar el GET incluyendo el token en el encabezado
  const response = await api
  .get("/api/blogs")
  .set("Authorization", `Bearer ${token}`)
  .expect(200)
  .expect("Content-Type", /application\/json/);
   
  // Verificar que se haya agregado el nuevo blog
  assert.strictEqual(response.body.length, 3); // Verificar que se ha agregado un nuevo blog

  const titles = response.body.map((blog) => blog.title);
  assert(titles.includes(newBlog.title));
});

test("Creating a blog fails with status 401 Unauthorized if no token is provided", async()=>{
  const newBlog = {
    title: "Blog sin token",
    content: "Contenido sin token",
    author: "Sin Autor",
    url: "http://example.com/sin-token",
    likes: 0,
  };

  // Intentar crear un blog SIN enviar el token
  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401);
})


/*test.only("a valid blog can be added", async () => {
  const newBlog = {
    title: "Jurarte mi amor frente a dios",
    content: "Content for the new blog post",
    author: "Test Author",
    url: "http://example.com/new-blog-post",
    likes: 0, // Opcional si quieres inicializarlo
  };

  //Agregar el nuevo blog
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFuZHJlYSIsImlkIjoiNjc5ZmU1ZGE1YjZlOGQ5ZDJmYTZjZGRkIiwiaWF0IjoxNzM4NTMyMzMwfQ.R6hckjRlScUjuW99SuWycYlqzZ6mYBs4H_ACG5fUma0";
  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201) //Verificar que el estado sea 201 CREATED
    .expect("Content-Type", /application\/json/);

  //Obtené todos los blogs despues de agregar el nuevo
  const response = await api.get("/api/blogs");

  //Verificar que la longitud aumentó
  assert.strictEqual(response.body.length, 3);

  //Verificar que el contenido este presente
  const titles = response.body.map((blog) => blog.title);

  assert(titles.includes("New Blog Post"));
});

test("blog without title is not added", async () => {
  const newBlog = {
    author: "Test Author",
    url: "http://example.com/blog-without-content",
    likes: 0,
  };

  //Intentar agregar el blog sin contenido
  await api.post("/api/blogs").send(newBlog).expect(400); //ESperamos un error 400 por falta de titulo

  // Obteer todos los blogs despues de la operacion
  const response = await api.get("/api/blogs");

  //Verificar que la cantidad de blogs no cambio

  assert.strictEqual(response.body.length, 2); //No se debe agregar el blog
});

test("blog without likes defaults to 0 likes", async () => {
  const newBlog = {
    title: "Blog without likes",
    content: "Content fot the blog without likes",
    author: "Test Author",
    url: "http://example.com/blog-without-likes",
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const createdBlog = response.body;
  assert.strictEqual(createdBlog.likes, 0); // Verificar que likes tiene un valor por defecto de 0
});

test("blog identifier is named id instead of _id", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const blogs = response.body;
  blogs.forEach((blog) => {
    assert(blog.id); //Verificar que existe la propiedad id
    assert(!blog._id); //Verificar que _id no esta presentes
  });
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are two blogs", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, 2);
});

test("the first blog is about Ciberseguridad Google", async () => {
  const response = await api.get("/api/blogs");
  console.log(response.body); // Imprime la respuesta para inspección

  const contents = response.body.map((e) => e.title);

  assert(contents.includes("Ciberseguridad Google"));
});

/**
 * Asegúrate de agregar pruebas para cubrir estos casos:
Error si no se proporciona username o password.

 * 
 * 
 */

/*describe("When there is initially one user in bd", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passWordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passWordHash });

    await user.save();
  });
  // este no se ejecuta una vez implemento el Token
  test("Creation succesds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    expect(response.status).toBe(201);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("Creation fails if username or password are shorter than 3 characters", async () => {
    const newUser = {
      username: "ab",
      name: "Short User",
      password: "12",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "Password must be at least 3 characters long and is required."
    );
  });

  test("creation fails if username is not unique", async () => {
    const newUser = {
      username: "root", // Ya existe en la base de datos
      name: "Duplicate User",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Username must be unique.");
  });

  test("creation succeeds with a fresh username", async () => {
    const newUser = {
      username: "john_doe",
      password: "123456",
      name: "John",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(201) // Asegura que la respuesta tiene el status 201 (Creado)
      .expect("Content-Type", /application\/json/); // Asegura que la respuesta es JSON

    // Verifica que el servidor devuelve el username correcto
    expect(result.body.username).toBe(newUser.username);
  });

  test("creation fails if username or password are missing", async () => {
    const newUser = { name: "Test User" }; // Falta username y password

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      "Username must be at least 3 characters long and is required."
    );
  });
});*/

after(async () => {
  await mongoose.connection.close();
});
