const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../backend/src/app");
const User = require("../backend/src/models/User");

/** Connect to the in-memory Mongo before tests run. */
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

/**
 * Capture a 6-digit OTP that the messaging service logs to the console.
 * Wraps console.log, runs `action`, and returns the first code found.
 */
async function captureOtp(action) {
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.map(String).join(" "));
  try {
    await action();
  } finally {
    console.log = original;
  }
  for (const line of lines) {
    const m = line.match(/is (\d{6})/i) || line.match(/\b(\d{6})\b/);
    if (m) return m[1];
  }
  throw new Error("OTP not found in captured output. Lines:\n" + lines.join("\n"));
}

/**
 * Register, then capture the OTP that was logged during registration, verify,
 * and return the access token + user object.
 */
async function createUser({ email, password = "Password123", role, fullName, organizationName }) {
  let captured;
  const lines = [];
  const original = console.log;
  console.log = (...args) => lines.push(args.map(String).join(" "));
  try {
    await request(app).post("/api/auth/register").send({ email, password }).expect(201);
  } finally {
    console.log = original;
  }
  for (const line of lines) {
    const m = line.match(/is (\d{6})/i) || line.match(/\b(\d{6})\b/);
    if (m) captured = m[1];
  }
  if (!captured) throw new Error("OTP not captured for " + email);

  const verify = await request(app).post("/api/auth/verify-email").send({ email, otp: captured }).expect(200);
  const token = verify.body.accessToken;

  if (role || fullName || organizationName) {
    const patch = {};
    if (role) patch.careconnect_role = role;
    if (fullName) patch.full_name = fullName;
    if (organizationName) patch.organization_name = organizationName;
    await request(app).patch("/api/auth/profile").set("Authorization", `Bearer ${token}`).send(patch).expect(200);
  }
  const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`).expect(200);
  return { token, user: me.body };
}

/** Log in an existing user and return the access token. */
async function login(email, password = "Password123") {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.accessToken;
}

/** Promote a user to platform admin (direct DB update) and return their token. */
async function makeAdmin(email) {
  await User.updateOne({ email }, { $set: { role: "admin" } });
  return login(email);
}

module.exports = { app, request, connectDB, clearDB, createUser, login, makeAdmin, captureOtp };