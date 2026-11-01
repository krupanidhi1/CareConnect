const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "", trim: true },
    location: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "General" },
    date: { type: Date, default: null, index: true },
    endDate: { type: Date, default: null },
    slots: { type: Number, default: 1, min: 0 },
    filledSlots: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Opportunity", opportunitySchema);