const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    requirementId: { type: mongoose.Schema.Types.ObjectId, ref: "Requirement", default: null, index: true },
    type: { type: String, enum: ["money", "goods", "time"], default: "goods", index: true },
    amount: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true, default: "" },
    note: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_transit", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    receiptUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("Donation", donationSchema);