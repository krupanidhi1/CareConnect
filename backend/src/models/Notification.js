const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "", trim: true },
    type: { type: String, default: "general" },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);