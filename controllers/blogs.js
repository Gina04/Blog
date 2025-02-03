const blogsRouter = require("express").Router();
const { request } = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  console.log("Blogs después de la inserción:", blogs);
  response.json(blogs);
});

//crear un get para traer de a un blog
blogsRouter.get("/:id", async(request, response) =>{
  try{
    //Buscar el blog por ID
    const blog = await Blog.findById(request.params.id).populate("user", {username: 1, name: 1})

    // Si no encuentra el blog, devolver un error 404
    if(!blog){
      return response.status(404).json({error: "blog not found"})
    }

    //Devolver el blog encontrado 
    response.json(blog)
  }catch(error){
    //En casa de un error, devolver un error 400

    response.status(400).json({error:"malformed id"})
  }
  
})
blogsRouter.post("/", async (request, response,next) => {

  console.log("Request body:", request.body);
  
  try {
    const body = request.body
    // obtén usuario desde el objeto de solicitud
    const userPost = request.user // El usuario ha sido agregado por el middleware userExtractor
  // ..
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }

    // Buscar al usuario que crea el blog
    const user = await User.findById(decodedToken.id);

    //const user = await User.findById(body.userId)

    //Verificar que el titulo este presente
    if (!body.title) {
      return response.status(400).json({ error: "title is required" });
    }
    //Establecer likes a 0 si no esta definido en el cuerpo
    const blog = new Blog({
      title: body.title,
      content: body.content,
      author: body.id || "Anonymous", // Autor predeterminado si no se envía
      url: body.url,
      likes: body.likes || 0, // Valor predeterminado para likes
      user: user._id, //Referencia al usuario creador
    });

    //Guardas el blog y actualizar la lista de blogs del usuario
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog); // Enviar respuesta con el blog guardado
  } catch (error) {
    if (error.name === "ValidationError") {
      //Devuelve un error 400 si hay un problema de validacion
      return response.status(400).json({ error: error.message });
    }

    next(error); //Pasa cualquier otro error al middleware de manejo de errores
  }
});

blogsRouter.delete("/:id", async (request, response) => {
  try {
    // obtén usuario desde el objeto de solicitud
    const userDelete = request.user  // El usuario ha sido agregado por el middleware userExtractor

   // ..
    // Verificar el token
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }
    //Buscar el blog en la base de datos
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
      return response.status(404).json({ error: "blog not found" });
    }

    // Verificar que el usuario autenticado es el creador del blog
    if (blog.user.toString() !== decodedToken.id.toString()) {
      return response.status(403).json({ error: "permission denied" });
    }

    //Eliminar el blog
    await blog.remove();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
