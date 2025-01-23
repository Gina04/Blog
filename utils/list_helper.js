const dummy = (blogs) => {
    return 1
  }

  const totalLikes = (blogs) =>{
    return blogs.reduce((sum,blog) => sum + blog.likes, 0)
    
  }

  const favoriteBlog = (blogs)=>{
   
      return blogs.reduce((favorite, blog) =>{
        return blog.likes > favorite.likes ? blog : favorite
      }, blogs[0])
  }
  
 //TODO 
//const mostBlogs = (blogs) =>{}
//const mostLikes = (blog) =>{}

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }