/**
 * CareConnect API server entry point.
 *
 * Loads environment, connects to MongoDB, mounts every route group under
 * /api (so the frontend points VITE_CARECONNECT_API_URL at http://localhost:5001/api),
 * and registers global error handling.
 */
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`CareConnect API running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
      logger.info(`API base: http://localhost:${PORT}/api`);
    });
    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down`);
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  })
  .catch((err) => {
    logger.error("Failed to start CareConnect API:", err.message);
    process.exit(1);
  });