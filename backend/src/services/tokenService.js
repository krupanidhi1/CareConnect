const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/env");
const { ApiError } = require("../utils");

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id || user.id), role: user.role, careconnectRole: user.careconnectRole },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: String(user._id || user.id), type: "refresh", jti: crypto.randomUUID() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    throw new ApiError(401, "Your session has expired. Please log in again.", { code: "INVALID_TOKEN" });
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (err) {
    throw new ApiError(401, "Refresh token is invalid or expired.", { code: "INVALID_REFRESH" });
  }
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };