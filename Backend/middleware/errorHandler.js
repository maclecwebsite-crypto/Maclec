const { sendError } = require("../utils/apiResponse");


const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};


const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  // Mongo duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(", ");
    message = `Duplicate value for field(s): ${field}`;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = { notFound, errorHandler };
