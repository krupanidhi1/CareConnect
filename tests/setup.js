/**
 * Jest setup — starts an in-memory MongoDB before the test suite and exposes
 * its URI via process.env so config/db.js connects to it.
 */
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.EMAIL_DEV_LOG = "true";
process.env.SMTP_HOST = "";
process.env.TWILIO_ACCOUNT_SID = "";
process.env.TWILIO_AUTH_TOKEN = "";
process.env.TWILIO_FROM_NUMBER = "";

const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
});

afterAll(async () => {
  if (mongo) await mongo.stop();
});

// Silence the logger during tests so the captured OTP lines are easy to find.
jest.spyOn(console, "error").mockImplementation(() => {});