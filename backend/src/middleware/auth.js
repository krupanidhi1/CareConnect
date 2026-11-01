const { verifyAccessToken } = require("../services/tokenService");
const { ApiError } = require("../utils");
const User = require("../models/User");

/**
 * Attach the authenticated user to req.user. Requires a Bearer access token.
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required.", { code: "NO_TOKEN" });
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) throw new ApiError(401, "Account not found.", { code: "USER_NOT_FOUND" });
    if (!user.isVerified && user.careconnectRole) {
      // allow profile/onboarding to complete verification; otherwise require verified email
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role guard. Accepts careconnect roles ("donor","organization","volunteer") and
 * "admin" (platform role). Admins pass every guard.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Authentication required."));
  const isPlatformAdmin = req.user.role === "admin";
  const ok = isPlatformAdmin || roles.includes(req.user.careconnectRole);
  if (!ok) return next(new ApiError(403, "You do not have permission to do that.", { code: "FORBIDDEN" }));
  next();
};

/** Optional auth: attaches user if a valid token is present, but never blocks. */
const softAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select("-passwordHash");
      if (user) req.user = user;
    }
  } catch {
    /* ignore — anonymous */
  }
  next();
};

module.exports = { protect, authorize, softAuth };