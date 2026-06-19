export default function errorHandler(err, req, res, next) {
  console.error('Error Handler Caught:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
  };

  // If there are validation errors (from express-validator or similar)
  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}
