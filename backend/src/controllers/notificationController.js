const Notification = require("../models/Notification");
const { asyncHandler } = require("../utils");
const { cleanDoc } = require("../utils");

const list = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(items.map((n) => cleanDoc(n)));
});

const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  res.json(cleanDoc(n));
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ message: "All notifications marked as read." });
});

module.exports = { list, markRead, markAllRead };