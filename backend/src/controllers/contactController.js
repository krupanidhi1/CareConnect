const ContactMessage = require("../models/ContactMessage");
const { asyncHandler, ApiError } = require("../utils");
const { cleanDoc } = require("../utils");

const create = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) throw new ApiError(400, "Name, email, subject and message are required.");
  const cm = await ContactMessage.create({ name, email, subject, message });
  res.status(201).json({ message: "Thanks for reaching out — we'll reply soon." });
});

module.exports = { create };