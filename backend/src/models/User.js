const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    // platform role: "admin" for platform administrators, "user" otherwise
    role: { type: String, enum: ["admin", "user"], default: "user", index: true },
    // careconnect role chosen during onboarding
    careconnectRole: {
      type: String,
      enum: ["donor", "organization", "volunteer"],
      default: null,
      index: true,
    },
    organizationName: { type: String, trim: true, default: "" },
    isVerified: { type: Boolean, default: false, index: true },
    isPhoneVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String, default: null, select: false },
    resetTokenHash: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash")) return next();
  // passwordHash may be set to a plaintext password by the controller; hash it
  if (!this.passwordHash || this.passwordHash.startsWith("$2")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.resetTokenHash;
    delete ret.resetTokenExpires;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);