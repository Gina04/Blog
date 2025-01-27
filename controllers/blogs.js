const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request =>{
  const authorization = request.get('authorization')
  if(authorization && authorization.startsWith('Bearer ')){
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  console.log("Blogs después de la inserción:", blogs);
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  try {
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if(!decodedToken.id){
      return response.status(401).json({error: 'token invalid'})
    }
    
    const user = await User.findById(decodedToken.id)

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
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog); // Enviar respuesta con el blog guardado
  } catch (error) {
    if (error.name === "ValidationError") {
      //Devuelve un error 400 si hay un problema de validacion
      return response.status(400).json({ error: error.message });
    }

    next(error); //Pasa cualquier otro error al middleware de manejo de errores
  }
});

blogsRouter.delete('/:id', async(request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
  })

module.exports = blogsRouter;
