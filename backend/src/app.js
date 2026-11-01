/**
 * Express application configuration. Routes are mounted under /api so the
 * frontend can target a single base URL (e.g. http://localhost:5001/api).
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const config = require("./config/env");
const { errorHandler, notFound } = require("./middleware/error");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Requests without Origin (health checks, CLI clients and tests) are
      // allowed. Browser origins must be explicitly listed in configuration.
      if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} is not allowed by CareConnect CORS policy.`));
    },
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
if (config.env !== "test") app.use(morgan(config.isProd ? "combined" : "dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "careconnect-api", time: new Date().toISOString() }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/organizations", require("./routes/organizationRoutes"));
app.use("/api/requirements", require("./routes/requirementRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/opportunities", require("./routes/opportunityRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;