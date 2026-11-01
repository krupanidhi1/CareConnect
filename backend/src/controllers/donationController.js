const Donation = require("../models/Donation");
const Requirement = require("../models/Requirement");
const Organization = require("../models/Organization");
const User = require("../models/User");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toDonation } = require("../utils/transforms");
const { notify } = require("../services/notificationService");
const { getOwnedOrg } = require("./organizationController");

const STATUS_FLOW = ["pending", "confirmed", "in_transit", "delivered", "cancelled"];

async function loadRelations(don) {
  const [donor, org, req] = await Promise.all([
    User.findById(don.donorId),
    Organization.findById(don.organizationId),
    don.requirementId ? Requirement.findById(don.requirementId) : null,
  ]);
  return toDonation(don, { donor, organization: org, requirement: req });
}

const create = asyncHandler(async (req, res) => {
  const { requirement_id, organization_id, type, amount, quantity, unit, note } = req.body;
  if (!organization_id && !requirement_id) throw new ApiError(400, "Select a requirement or organisation.");
  const requirement = requirement_id ? await Requirement.findById(requirement_id) : null;
  if (requirement_id && !requirement) throw new ApiError(404, "Requirement not found.");
  const orgId = organization_id || requirement?.organizationId;
  if (!orgId) throw new ApiError(400, "Could not resolve an organisation for this donation.");
  if (requirement && String(requirement.organizationId) !== String(orgId)) {
    throw new ApiError(400, "The selected requirement does not belong to that organisation.");
  }
  const targetOrg = await Organization.findById(orgId);
  if (!targetOrg || targetOrg.verificationStatus !== "approved") {
    throw new ApiError(400, "Donations can only be made to verified organisations.");
  }
  if (requirement && (!requirement.active || !["open", "partial"].includes(requirement.status))) {
    throw new ApiError(409, "This requirement is no longer accepting contributions.");
  }
  const safeQuantity = Number(quantity) || 0;
  const safeAmount = Number(amount) || 0;
  if (type && !["money", "goods", "time"].includes(type)) throw new ApiError(400, "Invalid donation type.");
  if (!Number.isFinite(safeQuantity) || !Number.isFinite(safeAmount) || safeQuantity < 0 || safeAmount < 0 || (safeQuantity === 0 && safeAmount === 0)) {
    throw new ApiError(400, "Enter a positive quantity or amount.");
  }
  if (requirement && safeQuantity > 0 && requirement.quantity > 0) {
    const [reserved] = await Donation.aggregate([
      { $match: { requirementId: requirement._id, status: { $in: ["pending", "confirmed", "in_transit"] } } },
      { $group: { _id: null, quantity: { $sum: "$quantity" } } },
    ]);
    const remaining = Math.max(0, requirement.quantity - requirement.fulfilledQuantity - (reserved?.quantity || 0));
    if (safeQuantity > remaining) throw new ApiError(400, `Only ${remaining} ${requirement.unit || "units"} remain for this requirement.`);
  }
  const don = await Donation.create({
    donorId: req.user._id,
    organizationId: orgId,
    requirementId: requirement_id || null,
    type: type || (Number(amount) > 0 ? "money" : "goods"),
    amount: safeAmount,
    quantity: safeQuantity,
    unit: unit || "",
    note: note || "",
    status: "pending",
  });
  // notify org owner
  const org = await Organization.findById(orgId).populate("ownerId");
  if (org && org.ownerId) {
    await notify(org.ownerId._id, { title: "New donation", body: `A donor contributed towards your requirement.`, type: "donation", link: "/dashboard" });
  }
  res.status(201).json(await loadRelations(don));
});

const mine = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = { donorId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Donation.countDocuments(filter),
  ]);
  const enriched = await Promise.all(items.map(loadRelations));
  res.json(paginate(enriched, total, page, limit));
});

const received = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "You do not have an organisation profile.", { code: "NO_ORG" });
  const { limit, page, skip } = parsePaging(req);
  const filter = { organizationId: org._id };
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Donation.countDocuments(filter),
  ]);
  const enriched = await Promise.all(items.map(loadRelations));
  res.json(paginate(enriched, total, page, limit));
});

const list = asyncHandler(async (req, res) => {
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

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!STATUS_FLOW.includes(status)) throw new ApiError(400, "Invalid status.");
  const don = await Donation.findById(req.params.id);
  if (!don) throw new ApiError(404, "Donation not found.");
  const isOrgOwner = String((await getOwnedOrg(req.user._id))?._id) === String(don.organizationId);
  if (!isOrgOwner && req.user.role !== "admin") throw new ApiError(403, "Only the receiving organisation can update status.");
  const allowedNext = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["in_transit", "delivered", "cancelled"],
    in_transit: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };
  if (status !== don.status && !allowedNext[don.status]?.includes(status)) {
    throw new ApiError(409, `A donation cannot move from ${don.status} to ${status}.`, { code: "INVALID_STATUS_TRANSITION" });
  }
  const wasDelivered = don.status === "delivered";
  don.status = status;
  if (note !== undefined) don.note = note;
  await don.save();
  // Advance requirement fulfilment only on the first transition to delivered.
  if (!wasDelivered && status === "delivered" && don.requirementId) {
    const r = await Requirement.findById(don.requirementId);
    if (r) {
      r.fulfilledQuantity = (r.fulfilledQuantity || 0) + (don.quantity || 0);
      if (r.quantity && r.fulfilledQuantity >= r.quantity) r.status = "fulfilled";
      else if (r.fulfilledQuantity > 0) r.status = "partial";
      await r.save();
    }
  }
  await notify(don.donorId, { title: "Donation updated", body: `Your donation is now ${status}.`, type: "donation", link: "/dashboard" });
  res.json(await loadRelations(don));
});

module.exports = { create, mine, received, list, updateStatus, loadRelations };