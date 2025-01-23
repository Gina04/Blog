const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  console.log("Blogs después de la inserción:", blogs);
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  try {
    const body = new Blog(request.body);

    //Verificar que el titulo este presente
    if (!body.title) {
      return response.status(400).json({ error: "title is required" });
    }
    //Establecer likes a 0 si no esta definido en el cuerpo
    const blog = new Blog({
      title: body.title,
      content: body.content,
      author: body.author || "Anonymous", // Autor predeterminado si no se envía
      url: body.url,
      likes: body.likes || 0, // Valor predeterminado para likes
    });

    const savedBlog = await blog.save();
    response.status(201).json(savedBlog); // Enviar respuesta con el blog guardado
  } catch (error) {
    if (error.name === "ValidationError") {
      //Devuelve un error 400 si hay un problema de validacion
      return response.status(400).json({ error: error.message });
    }

    next(error); //Pasa cualquier otro error al middleware de manejo de errores
  }
});

module.exports = blogsRouter;
