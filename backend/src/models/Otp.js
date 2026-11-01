const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    target: { type: String, required: true, trim: true, index: true },
    purpose: { type: String, enum: ["email", "phone", "reset"], default: "email", index: true },
    codeHash: { type: String, required: true },
    consumed: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

otpSchema.index({ target: 1, purpose: 1, consumed: 1 });

module.exports = mongoose.model("Otp", otpSchema);