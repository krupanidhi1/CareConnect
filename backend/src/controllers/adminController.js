const User = require("../models/User");
const Organization = require("../models/Organization");
const Donation = require("../models/Donation");
const Requirement = require("../models/Requirement");
const ContactMessage = require("../models/ContactMessage");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toAdminUser, toOrganization, toDonation } = require("../utils/transforms");
const { loadRelations } = require("./donationController");

const stats = asyncHandler(async (_req, res) => {
  const [totalUsers, donors, volunteers, organizations, verifiedOrganizations, pendingOrganizations, totalDonations, totalRequirements, contactMessages] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ careconnectRole: "donor" }),
    User.countDocuments({ careconnectRole: "volunteer" }),
    Organization.countDocuments(),
    Organization.countDocuments({ verificationStatus: "approved" }),
    Organization.countDocuments({ verificationStatus: "pending" }),
    Donation.countDocuments(),
    Requirement.countDocuments({ active: true }),
    ContactMessage.countDocuments({ status: "new" }),
  ]);
  res.json({
    totalUsers,
    donors,
    volunteers,
    organizations,
    verifiedOrganizations,
    pendingOrganizations,
    totalDonations,
    totalRequirements,
    contactMessages,
  });
});

const analytics = asyncHandler(async (_req, res) => {
  const monthLabel = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };

  const monthlyAgg = await Donation.aggregate([
    { $group: { _id: monthLabel, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
    { $project: { _id: 0, month: "$_id", total: "$total", count: "$count" } },
  ]);

  const registrationAgg = await User.aggregate([
    { $group: { _id: monthLabel, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
    { $project: { _id: 0, month: "$_id", count: "$count" } },
  ]);

  const byCategory = await Donation.aggregate([
    { $lookup: { from: "requirements", localField: "requirementId", foreignField: "_id", as: "req" } },
    { $unwind: { path: "$req", preserveNullAndEmptyArrays: true } },
    { $group: { _id: "$req.category", count: { $sum: 1 }, total: { $sum: "$amount" } } },
    { $project: { _id: 0, category: { $ifNull: ["$_id", "Other"] }, count: "$count", total: "$total" } },
  ]);

  const byStatus = await Donation.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: "$count" } },
  ]);

  res.json({
    monthlyDonations: monthlyAgg,
    registrationTrend: registrationAgg,
    userGrowth: registrationAgg,
    byCategory,
    byStatus,
  });
});

const users = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = {};
  if (req.query.role) filter.$or = [{ role: req.query.role }, { careconnectRole: req.query.role }];
  if (req.query.search) {
    const s = req.query.search;
    filter.$and = (filter.$and || []).concat([
      { $or: [{ fullName: new RegExp(s, "i") }, { email: new RegExp(s, "i") }] },
    ]);
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginate(items.map(toAdminUser), total, page, limit));
});

const user = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) throw new ApiError(404, "User not found.");
  res.json(toAdminUser(u));
});

const organizations = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = {};
  if (req.query.status) filter.verificationStatus = req.query.status;
  if (req.query.verified) filter.verificationStatus = "approved";
  const [items, total] = await Promise.all([
    Organization.find(filter).sort({ verificationStatus: 1, createdAt: -1 }).skip(skip).limit(limit),
    Organization.countDocuments(filter),
  ]);
  res.json(paginate(items.map((o) => toOrganization(o)), total, page, limit));
});

const reviewOrganization = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) throw new ApiError(400, "Invalid status.");
  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, "Organisation not found.");
  org.verificationStatus = status;
  if (reason !== undefined) org.verificationReason = reason;
  await org.save();
  if (org.ownerId) {
    const { notify } = require("../services/notificationService");
    await notify(org.ownerId, {
      title: status === "approved" ? "Organisation verified" : "Verification update",
      body: status === "approved" ? `Congratulations — ${org.name} is now verified.` : `Your verification was ${status}. ${reason || ""}`.trim(),
      type: "verification",
      link: "/dashboard",
    });
  }
  res.json(toOrganization(org));
});

const donations = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Donation.countDocuments(filter),
  ]);
  const enriched = await Promise.all(items.map(loadRelations));
  res.json(paginate(enriched, total, page, limit));
});

const exportDonations = asyncHandler(async (_req, res) => {
  const items = await Donation.find().sort({ createdAt: -1 }).limit(1000);
  const enriched = await Promise.all(items.map(loadRelations));
  const header = ["Donor", "Organisation", "Requirement", "Quantity", "Unit", "Amount", "Status", "Date"];
  const rows = enriched.map((d) => [
    d.donorName || "",
    d.organizationName || "",
    d.requirementTitle || "",
    d.quantity || "",
    d.unit || "",
    d.amount || "",
    d.status || "",
    d.createdAt ? new Date(d.createdAt).toISOString() : "",
  ]);
  const escape = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=careconnect-donations.csv");
  res.send(csv);
});

module.exports = { stats, analytics, users, user, organizations, reviewOrganization, donations, exportDonations };