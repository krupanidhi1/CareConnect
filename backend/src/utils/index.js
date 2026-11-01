const logger = require("./logger");

/** Throwing API error carrying an HTTP status and optional code/details. */
class ApiError extends Error {
  constructor(statusCode, message, { code, details } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

/** Wrap an async route handler so rejected promises reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Map any Mongoose doc to a plain object with `id` (string) + ISO date fields. */
const cleanDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) obj.id = String(obj._id);
  if (obj.createdAt) {
    obj.createdAt = obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt;
    obj.created_date = obj.createdAt;
  }
  if (obj.updatedAt) {
    obj.updatedAt = obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : obj.updatedAt;
    obj.updated_date = obj.updatedAt;
  }
  return obj;
};

/** Build a pagination envelope the frontend accepts (array OR {items,total,pagination}). */
const paginate = (items, total, page, limit) => ({
  items,
  total,
  page,
  limit,
  pagination: {
    total,
    page,
    limit,
    hasMore: page * limit < total,
  },
});

/** Parse `?page`/`?limit` query into sane integers. */
const parsePaging = (req) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

/** Sleep helper. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { ApiError, asyncHandler, cleanDoc, paginate, parsePaging, sleep, logger };