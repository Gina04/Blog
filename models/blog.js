const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true // Esto asegura que el título no puede estar vacío
    },
    author: String,
    url: String,
    likes: Number
  })
  
  //Transformacion del metodo toJSON 
  blogSchema.set('toJSON',{
    transform: (document, returnedObject) =>{
      returnedObject.id = returnedObject._id.toString() //Renombrar _id a id 
      delete returnedObject._id //Eliminar _id
      delete returnedObject.__v //Eliminar _v

    }
  })
module.exports = mongoose.model('Blog', blogSchema)
  