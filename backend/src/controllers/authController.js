const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Otp = require("../models/Otp");
const { ApiError, asyncHandler } = require("../utils");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../services/tokenService");
const { issueOtp, verifyOtp } = require("../services/otpService");
const { sendOtpEmail, sendOtpSms } = require("../services/messagingService");
const { notify } = require("../services/notificationService");
const { toPublicUser } = require("../utils/transforms");
const config = require("../config/env");

function setRefreshCookie(res, token) {
  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(config.cookie.name, { httpOnly: true, secure: config.cookie.secure, sameSite: config.cookie.sameSite });
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function matchesRefreshToken(token, storedHash) {
  if (!token || !storedHash) return false;
  const candidate = Buffer.from(hashRefreshToken(token), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");
  if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters.");
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "An account with that email already exists.", { code: "EMAIL_TAKEN" });
  const user = new User({ email, passwordHash: password });
  await user.save();
  const code = await issueOtp({ target: user.email, purpose: "email" });
  await sendOtpEmail({ to: user.email, code, purpose: "email" });
  res.status(201).json({ message: "Account created. Check your email for the verification code.", userId: String(user._id) });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and verification code are required.");
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, "No account found for that email.", { code: "USER_NOT_FOUND" });
  await verifyOtp({ target: user.email, purpose: "email", code: String(otp) });
  user.isVerified = true;
  await user.save();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user: toPublicUser(user) });
});

const resendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required.");
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, "No account found for that email.", { code: "USER_NOT_FOUND" });
  const code = await issueOtp({ target: user.email, purpose: "email" });
  await sendOtpEmail({ to: user.email, code, purpose: "email" });
  res.json({ message: "A new verification code has been sent." });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required.");
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw new ApiError(401, "Invalid email or password.", { code: "BAD_CREDENTIALS" });
  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid email or password.", { code: "BAD_CREDENTIALS" });
  if (!user.isVerified) throw new ApiError(403, "Please verify your email before logging in.", { code: "EMAIL_NOT_VERIFIED" });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user: toPublicUser(user) });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies && req.cookies[config.cookie.name];
  if (!token) throw new ApiError(401, "No refresh token provided.", { code: "NO_REFRESH" });
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.sub).select("+refreshTokenHash");
  if (!user || !matchesRefreshToken(token, user.refreshTokenHash)) {
    throw new ApiError(401, "Refresh token is invalid, expired or has already been rotated.", { code: "INVALID_REFRESH" });
  }
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies && req.cookies[config.cookie.name];
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.sub).select("+refreshTokenHash");
      if (user && matchesRefreshToken(token, user.refreshTokenHash)) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch {
      // Logout remains idempotent even when the refresh cookie is expired or invalid.
    }
  }
  clearRefreshCookie(res);
  res.json({ message: "Logged out." });
});

const me = asyncHandler(async (req, res) => {
  res.json(toPublicUser(req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["fullName", "phone", "location", "careconnectRole", "organizationName"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  // support snake_case from frontend
  if (req.body.full_name !== undefined) updates.fullName = req.body.full_name;
  if (req.body.careconnect_role !== undefined) updates.careconnectRole = req.body.careconnect_role;
  if (req.body.organization_name !== undefined) updates.organizationName = req.body.organization_name;
  if (updates.phone !== undefined && String(updates.phone) !== String(req.user.phone || "")) {
    updates.isPhoneVerified = false;
  }

  if (updates.careconnectRole && !["donor", "organization", "volunteer"].includes(updates.careconnectRole)) {
    throw new ApiError(400, "Invalid role.");
  }
  if (req.user.careconnectRole && updates.careconnectRole && updates.careconnectRole !== req.user.careconnectRole) {
    throw new ApiError(403, "Your account role cannot be changed after onboarding.", { code: "ROLE_LOCKED" });
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });

  // When someone becomes an organization, create the Organization record once.
  if (updates.careconnectRole === "organization" && user.organizationName) {
    const existing = await Organization.findOne({ ownerId: user._id });
    if (!existing) {
      await Organization.create({ name: user.organizationName, ownerId: user._id, email: user.email, phone: user.phone });
    } else {
      existing.name = user.organizationName;
      await existing.save();
    }
  }

  res.json(toPublicUser(user));
});

const verifyPhone = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) throw new ApiError(400, "Phone and code are required.");
  await verifyOtp({ target: phone, purpose: "phone", code: String(otp) });
  req.user.phone = phone;
  req.user.isPhoneVerified = true;
  await req.user.save();
  res.json({ message: "Phone number verified." });
});

const resendPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone is required.");
  const code = await issueOtp({ target: phone, purpose: "phone" });
  await sendOtpSms({ to: phone, code });
  res.json({ message: "A new SMS code has been sent." });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Always respond generically — never reveal whether the email exists.
  if (email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const code = await issueOtp({ target: user.email, purpose: "reset" });
      user.resetTokenHash = await bcrypt.hash(code, 10);
      user.resetTokenExpires = new Date(Date.now() + config.otp.ttlMinutes * 60000);
      await user.save();
      await sendOtpEmail({ to: user.email, code, purpose: "reset" });
    }
  }
  res.json({ message: "If that email exists, a reset code has been sent." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) throw new ApiError(400, "Email, reset code and new password are required.");
  if (newPassword.length < 8) throw new ApiError(400, "Password must be at least 8 characters.");
  const user = await User.findOne({ email: email.toLowerCase(), resetTokenHash: { $ne: null }, resetTokenExpires: { $gt: new Date() } }).select("+passwordHash");
  if (!user) throw new ApiError(400, "Reset code is invalid or expired.", { code: "RESET_INVALID" });
  // The OTP service enforces expiry, single-use semantics and the five-attempt limit.
  await verifyOtp({ target: user.email, purpose: "reset", code: String(token) });
  const ok = await bcrypt.compare(String(token), user.resetTokenHash);
  if (!ok) throw new ApiError(400, "Reset code is invalid or expired.", { code: "RESET_INVALID" });
  user.passwordHash = newPassword;
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  user.refreshTokenHash = null;
  await user.save();
  res.json({ message: "Password reset. You can log in now." });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, "Current and new passwords are required.");
  if (newPassword.length < 8) throw new ApiError(400, "New password must be at least 8 characters.");
  const user = await User.findById(req.user._id).select("+passwordHash");
  const match = await user.comparePassword(currentPassword);
  if (!match) throw new ApiError(400, "Current password is incorrect.", { code: "BAD_CURRENT_PASSWORD" });
  user.passwordHash = newPassword;
  user.refreshTokenHash = null;
  await user.save();
  res.json({ message: "Password updated. Please log in again on your devices." });
});

module.exports = {
  register,
  verifyEmail,
  resendEmailOtp,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  verifyPhone,
  resendPhoneOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  setRefreshCookie,
  clearRefreshCookie,
};