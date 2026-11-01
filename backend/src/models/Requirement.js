const mongoose = require("mongoose");

const CATEGORIES = ["Food", "Clothing", "Medicines", "Healthcare", "Education", "Furniture", "Financial Support", "Other"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

const requirementSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "", trim: true },
    category: { type: String, enum: CATEGORIES, default: "Other", index: true },
    priority: { type: String, enum: PRIORITIES, default: "medium", index: true },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true, default: "" },
    fulfilledQuantity: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ["open", "partial", "fulfilled", "closed"], default: "open", index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

requirementSchema.virtual("progress").get(function () {
  if (!this.quantity) return 0;
  return Math.min(100, Math.round((this.fulfilledQuantity / this.quantity) * 100));
});

requirementSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Requirement", requirementSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.PRIORITIES = PRIORITIES;