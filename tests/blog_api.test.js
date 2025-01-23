const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert');
const api = supertest(app)
const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({}); // Limpia la base de datos de prueba antes de cada test

  const blog1 = new Blog({
    title: 'Ciberseguridad Google',
    content: 'Ciberseguridad Google',
    author: 'Author 1',
  });

  const blog2 = new Blog({
    title: 'Test Blog 2',
    content: 'Otro contenido',
    author: 'Author 2',
  });

  await blog1.save();
  await blog2.save();
});

test('a valid blog can be added', async() =>{
  const newBlog ={
    title: 'New Blog Post',
    content: 'Content for the new blog post',
    author: 'Test Author',
    url: 'http://example.com/new-blog-post',
    likes: 0, // Opcional si quieres inicializarlo
  }

//Agregar el nuevo blog
await api 
  .post('/api/blogs')
  .send(newBlog)
  .expect(201) //Verificar que el estado sea 201 CREATED
  .expect('Content-Type', /application\/json/)

//Obtené todos los blogs despues de agregar el nuevo
const response = await api.get('/api/blogs')

//Verificar que la longitud aumentó
assert.strictEqual(response.body.length, 3)

//Verificar que el contenido este presente 
const titles = response.body.map(blog => blog.title)

assert(titles.includes('New Blog Post'))
})

test('blog without title is not added', async() =>{
  const newBlog ={
    author: 'Test Author', 
    url : 'http://example.com/blog-without-content', 
    likes: 0
  }

  //Intentar agregar el blog sin contenido 
  await api
  .post('/api/blogs')
  .send(newBlog)
  .expect(400) //ESperamos un error 400 por falta de titulo

  // Obteer todos los blogs despues de la operacion
  const response = await api.get('/api/blogs')
  
  //Verificar que la cantidad de blogs no cambio

  assert.strictEqual(response.body.length, 2) //No se debe agregar el blog
})

test('blog without likes defaults to 0 likes', async () =>{
  const newBlog = {
    title: 'Blog without likes', 
    content:'Content fot the blog without likes', 
    author: 'Test Author', 
    url: 'http://example.com/blog-without-likes'
  }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const createdBlog = response.body
    assert.strictEqual(createdBlog.likes,0) // Verificar que likes tiene un valor por defecto de 0

   

})

test.only('blog identifier is named id instead of _id', async()=>{
  const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const blogs = response.body
    blogs.forEach((blog) =>{
      assert(blog.id) //Verificar que existe la propiedad id 
      assert(!blog._id) //Verificar que _id no esta presentes
    })
})

test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () =>{
    const response = await api
    .get('/api/blogs')

    assert.strictEqual(response.body.length, 2)
  })

  test('the first blog is about Ciberseguridad Google', async () => {
    const response = await api.get('/api/blogs')
    console.log(response.body);  // Imprime la respuesta para inspección

    const contents = response.body.map(e => e.title)

    assert(contents.includes('Ciberseguridad Google'))
  })

  console.log('CURRENTEEEE NODE_ENV:', process.env.NODE_ENV);

after(async () => {
    await mongoose.connection.close()
  })
  