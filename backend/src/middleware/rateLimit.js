const rateLimit = require("express-rate-limit");
const { ApiError } = require("../utils");

const stdLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, "Too many requests. Please slow down.", { code: "RATE_LIMIT" });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, "Too many authentication attempts. Try again later.", { code: "AUTH_RATE_LIMIT" });
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, "Too many OTP requests. Try again later.", { code: "OTP_RATE_LIMIT" });
  },
});

module.exports = { stdLimiter, authLimiter, otpLimiter };