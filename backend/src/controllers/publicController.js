const User = require("../models/User");
const Organization = require("../models/Organization");
const Requirement = require("../models/Requirement");
const Donation = require("../models/Donation");
const { asyncHandler } = require("../utils");
const { toOrganization, toRequirement } = require("../utils/transforms");

const stats = asyncHandler(async (_req, res) => {
  const [totalUsers, donors, volunteers, organizations, verifiedOrganizations, pendingOrganizations, totalDonations, totalRequirements] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ careconnectRole: "donor" }),
    User.countDocuments({ careconnectRole: "volunteer" }),
    Organization.countDocuments(),
    Organization.countDocuments({ verificationStatus: "approved" }),
    Organization.countDocuments({ verificationStatus: "pending" }),
    Donation.countDocuments(),
    Requirement.countDocuments({ active: true, status: { $in: ["open", "partial"] } }),
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
    // aliases some dashboards read
    donationCount: totalDonations,
    requirementCount: totalRequirements,
  });
});

const featuredOrganizations = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 24);
  const orgs = await Organization.find({ verificationStatus: "approved" })
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit);
  res.json(orgs.map((o) => toOrganization(o)));
});

const urgentRequirements = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 24);
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const approvedOrganizations = await Organization.find({ verificationStatus: "approved" }).distinct("_id");
  const reqs = await Requirement.find({
    active: true,
    status: { $in: ["open", "partial"] },
    organizationId: { $in: approvedOrganizations },
  })
    .populate("organizationId")
    .limit(limit * 3);
  const sorted = reqs
    .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9))
    .slice(0, limit);
  res.json(sorted.map((r) => toRequirement(r, { organization: r.organizationId })));
});

module.exports = { stats, featuredOrganizations, urgentRequirements };