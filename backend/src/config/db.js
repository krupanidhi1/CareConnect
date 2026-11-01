const mongoose = require("mongoose");
const { logger } = require("../utils");

/**
 * Connect to MongoDB. Mongoose is configured with strict query mode and
 * reasonable timeouts so the server fails fast when the DB is unreachable.
 */
async function connectDB() {
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/careconnect", {
    serverSelectionTimeoutMS: 10000,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;