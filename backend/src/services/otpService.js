const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const config = require("../config/env");
const { ApiError } = require("../utils");
const Otp = require("../models/Otp");

/** Generate a numeric OTP of the configured length. */
function generateCode() {
  const len = config.otp.length;
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(crypto.randomInt(min, max));
}

/**
 * Issue an OTP for a target (email or phone) + purpose.
 * Enforces a resend cooldown and single-use semantics. Returns the plain code
 * so the caller (messaging service) can deliver it.
 */
async function issueOtp({ target, purpose }) {
  const cooldownMs = config.otp.resendCooldownSeconds * 1000;
  const existing = await Otp.findOne({ target, purpose, consumed: false }).sort({ createdAt: -1 });
  if (existing && Date.now() - existing.createdAt.getTime() < cooldownMs) {
    const wait = Math.ceil((cooldownMs - (Date.now() - existing.createdAt.getTime())) / 1000);
    throw new ApiError(429, `Please wait ${wait}s before requesting another code.`, { code: "OTP_COOLDOWN" });
  }

  const code = generateCode();
  const hashed = await bcrypt.hash(code, 10);
  await Otp.create({ target, purpose, codeHash: hashed, expiresAt: new Date(Date.now() + config.otp.ttlMinutes * 60000) });
  return code;
}

/**
 * Verify a submitted OTP. Single-use: consumed on success. Throws on mismatch,
 * expiry, or too many attempts.
 */
async function verifyOtp({ target, purpose, code }) {
  const record = await Otp.findOne({ target, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!record) throw new ApiError(400, "No active code found. Request a new one.", { code: "OTP_NOT_FOUND" });
  if (record.expiresAt < new Date()) throw new ApiError(400, "That code has expired. Request a new one.", { code: "OTP_EXPIRED" });
  if (record.attempts >= 5) throw new ApiError(429, "Too many attempts. Request a new code.", { code: "OTP_TOO_MANY" });

  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, "Incorrect verification code.", { code: "OTP_INVALID" });
  }
  record.consumed = true;
  await record.save();
  return true;
}

module.exports = { generateCode, issueOtp, verifyOtp };