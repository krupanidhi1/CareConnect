const Notification = require("../models/Notification");

/** Create a notification for a user. Fire-and-forget; never throws. */
async function notify(userId, { title, body, type, link } = {}) {
  try {
    if (!userId) return;
    await Notification.create({ userId, title, body: body || "", type: type || "general", link: link || "" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("notification create failed:", err.message);
  }
}

module.exports = { notify };