function errorHandler(err, req, res, next) {
  let { statusCode = 500, message = "Something went wrong!" } = err;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  console.error(`[Error] ${statusCode} - ${message}:`, process.env.NODE_ENV !== "production" ? err.stack : err.message);

  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }

  res.status(statusCode).render("errors/error.ejs", {
    statusCode,
    message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : null,
  });
}

module.exports = errorHandler;
