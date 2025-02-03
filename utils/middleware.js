const logger = require("./logger");
const jwt = require('jsonwebtoken')
const User = require("../models/user");
const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};
const userExtractor = async(request,response,next) =>{
  const authorization = request.get('Authorization') // Obtenemos el encabezado Authorization

  if(!authorization || !authorization.startsWith('Bearer ')){
    return response.status(401).json({error: 'Token missing or invalid'})
  }

  const token = authorization.replace('Bearer ', '')//Extraemos el token del encabezado
  try{
    const decodedToken = jwt.verify(token,process.env.SECRET)
    if(!decodedToken.id){
      return response.status(401).json({error: 'Token invalid'})
    }
    //Buscamos al usuario por el id en el token y lo agregamos al request 
    const user = await User.findById(decodedToken.id)
    request.user = user //Guardamos el usuario en el request
    next() //Llamamos a la siguiente funcion del middleware
  }catch(error){
    return response.status(401).json({error: 'token invalid baddd'})
  }
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null; // Si no hay token, asegúrate de que sea null
  }
  next(); // Llama a next() para continuar con la cadena de middlewares
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  console.log("Middleware de errores activado:", error); // Agrega un log para seguimiento

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};
