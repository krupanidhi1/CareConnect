/**
 * CareConnect seed script.
 *
 * Creates demo accounts (already email-verified so you can log in directly),
 * a sample organisation, requirements, donations, volunteer opportunities and
 * applications. Idempotent: re-running updates existing demo records.
 *
 * Run: npm run seed   (after MONGODB_URI is set in .env)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { logger } = require("../utils");

const User = require("../models/User");
const Organization = require("../models/Organization");
const Requirement = require("../models/Requirement");
const Donation = require("../models/Donation");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const Notification = require("../models/Notification");

async function upsertUser(data) {
  let u = await User.findOne({ email: data.email });
  if (u) {
    u.passwordHash = data.password; // pre-save will hash
    u.fullName = data.fullName;
    u.role = data.role;
    u.careconnectRole = data.careconnectRole;
    u.isVerified = true;
    u.phone = data.phone || "";
    u.location = data.location || "";
    u.organizationName = data.organizationName || "";
    await u.save();
    return u;
  }
    u = new User({
    ...data,
    passwordHash: data.password,
    isVerified: true
  });

  await u.save();
  return u;
}



async function run() {
  await connectDB();
  logger.info("Seeding CareConnect demo data…");

  const admin = await upsertUser({ email: "admin@careconnect.demo", password: "Password123", fullName: "Platform Admin", role: "admin", careconnectRole: null, phone: "+919800000001", location: "Bengaluru, Karnataka" });

  const donor = await upsertUser({ email: "donor@careconnect.demo", password: "Password123", fullName: "Krupa Yadav", role: "user", careconnectRole: "donor", phone: "+919800000002", location: "Pune, Maharashtra" });

  const orgUser = await upsertUser({ email: "home@careconnect.demo", password: "Password123", fullName: "Sunrise Old Age Home", role: "user", careconnectRole: "organization", phone: "+919800000003", location: "Hyderabad, Telangana", organizationName: "Sunrise Old Age Home" });

  const volunteer = await upsertUser({ email: "volunteer@careconnect.demo", password: "Password123", fullName: "Aarav Sharma", role: "user", careconnectRole: "volunteer", phone: "+919800000004", location: "Hyderabad, Telangana" });

  let org = await Organization.findOne({ ownerId: orgUser._id });
  if (!org) {
    org = await Organization.create({
      name: "Sunrise Old Age Home",
      description: "A community-run home caring for 38 elderly residents in Hyderabad. We provide meals, medical support and companionship.",
      ownerId: orgUser._id,
      email: orgUser.email,
      phone: orgUser.phone,
      location: "Hyderabad, Telangana",
      city: "Hyderabad",
      state: "Telangana",
      verificationStatus: "approved",
      featured: true,
    });
  }

  const reqs = [
    { title: "Monthly groceries — rice and dal", category: "Food", priority: "urgent", quantity: 200, unit: "kg", description: "Staple grains for the month." },
    { title: "Winter blankets", category: "Clothing", priority: "high", quantity: 50, unit: "pcs", description: "Warm blankets for the winter months." },
    { title: "Blood pressure medicines", category: "Medicines", priority: "high", quantity: 30, unit: "courses", description: "Monthly medication for hypertensive residents." },
    { title: "Wheelchair repairs", category: "Healthcare", priority: "medium", quantity: 4, unit: "units", description: "Servicing for four wheelchairs." },
  ];
  for (const r of reqs) {
    const exists = await Requirement.findOne({ organizationId: org._id, title: r.title });
    if (!exists) await Requirement.create({ ...r, organizationId: org._id, fulfilledQuantity: 0, status: "open" });
  }

  const allReqs = await Requirement.find({ organizationId: org._id });
  const don = await Donation.create({
    donorId: donor._id,
    organizationId: org._id,
    requirementId: allReqs[0]._id,
    type: "money",
    amount: 5000,
    status: "confirmed",
    note: "Towards monthly groceries",
  });

  const opp = await Opportunity.create({
    organizationId: org._id,
    title: "Weekend companionship visits",
    description: "Spend a Saturday morning with residents — reading, conversation and games.",
    location: "Hyderabad, Telangana",
    city: "Hyderabad",
    state: "Telangana",
    category: "Companionship",
    date: new Date(Date.now() + 7 * 86400000),
    slots: 10,
    filledSlots: 0,
    status: "open",
  });

  await Application.create({
    opportunityId: opp._id,
    organizationId: org._id,
    volunteerId: volunteer._id,
    message: "I would love to help with the Saturday visits.",
    status: "pending",
  });

  await Notification.create({ userId: donor._id, title: "Welcome to CareConnect", body: "Thanks for joining. Browse open requirements to start giving.", type: "general" });
  await Notification.create({ userId: orgUser._id, title: "New donation", body: "Krupa Yadav contributed ₹5,000 towards monthly groceries.", type: "donation" });
  await Notification.create({ userId: volunteer._id, title: "Application submitted", body: "You applied for Weekend companionship visits.", type: "application" });

  logger.info("Seed complete. Demo credentials (all use password Password123):");
  logger.info("  admin@careconnect.demo     (admin)");
  logger.info("  donor@careconnect.demo      (donor)");
  logger.info("  home@careconnect.demo       (organisation)");
  logger.info("  volunteer@careconnect.demo  (volunteer)");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  logger.error("Seed failed:", err.message);
  process.exit(1);
});