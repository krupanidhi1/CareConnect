const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, default: "", trim: true },
    availability: { type: String, default: "", trim: true, maxlength: 240 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    note: { type: String, default: "", trim: true },
    hoursLogged: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

applicationSchema.index({ volunteerId: 1, status: 1 });
applicationSchema.index({ opportunityId: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);