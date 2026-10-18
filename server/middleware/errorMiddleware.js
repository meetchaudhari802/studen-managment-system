/**
 * Centralized Error Handling Middleware (server/middleware/errorMiddleware.js)
 * Catches all unhandled errors and formats them into a standardized JSON response:
 * { success: false, message: "..." }
 */

// 404 Not Found Handler for unknown API routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`
  });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.status || 500);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for identifier '${err.value}'.`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token expired. Please login again.'
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { notFoundHandler, errorHandler };
