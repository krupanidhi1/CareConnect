const { ApiError } = require("../utils");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, { code: "NOT_FOUND" }));
}

function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    message: err.isOperational ? err.message : "Something went wrong on the server.",
    code: err.code,
  };
  if (err.details) payload.details = err.details;
  if (!err.isOperational && status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[UNHANDLED]", err);
  }
  if (err.name === "ValidationError" || err.name === "MongoServerError") {
    return res.status(400).json({ message: err.message || "Validation failed.", code: "VALIDATION", details: err.errors });
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler, ApiError };