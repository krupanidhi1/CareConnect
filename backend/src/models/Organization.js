const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "", trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    // pending | approved | rejected
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    verificationReason: { type: String, default: "" },
    verificationDocuments: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

organizationSchema.virtual("verified").get(function () {
  return this.verificationStatus === "approved";
});

organizationSchema.index({ name: "text", description: "text", city: "text", state: "text" });

module.exports = mongoose.model("Organization", organizationSchema);