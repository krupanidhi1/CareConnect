const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const Organization = require("../models/Organization");
const User = require("../models/User");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toApplication } = require("../utils/transforms");
const { notify } = require("../services/notificationService");
const { getOwnedOrg } = require("./organizationController");

async function loadRelations(app) {
  const [opp, volunteer, org] = await Promise.all([
    Opportunity.findById(app.opportunityId),
    User.findById(app.volunteerId),
    Organization.findById(app.organizationId || (await Opportunity.findById(app.opportunityId))?.organizationId),
  ]);
  return toApplication(app, { opportunity: opp, volunteer, organization: org });
}

const apply = asyncHandler(async (req, res) => {
  const { opportunity_id, message, availability } = req.body;
  if (!opportunity_id) throw new ApiError(400, "Opportunity is required.");
  const opp = await Opportunity.findById(opportunity_id);
  if (!opp) throw new ApiError(404, "Opportunity not found.");
  if (opp.status !== "open") throw new ApiError(409, "This opportunity is no longer accepting applications.");
  const opportunityOrg = await Organization.findById(opp.organizationId);
  if (!opportunityOrg || opportunityOrg.verificationStatus !== "approved") {
    throw new ApiError(403, "Applications are only open for verified organisations.");
  }
  if (opp.filledSlots >= opp.slots) throw new ApiError(409, "This opportunity has no remaining places.");
  const existing = await Application.findOne({ opportunityId: opp._id, volunteerId: req.user._id });
  if (existing) throw new ApiError(409, "You have already applied for this opportunity.", { code: "ALREADY_APPLIED" });
  const app = await Application.create({
    opportunityId: opp._id,
    organizationId: opp.organizationId,
    volunteerId: req.user._id,
    message: message || "",
    availability: availability || "",
  });
  const org = await Organization.findById(opp.organizationId).populate("ownerId");
  if (org && org.ownerId) {
    await notify(org.ownerId._id, { title: "New volunteer application", body: `Someone applied to "${opp.title}".`, type: "application", link: "/dashboard" });
  }
  res.status(201).json(await loadRelations(app));
});

const mine = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = { volunteerId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);
  const enriched = await Promise.all(items.map(loadRelations));
  res.json(paginate(enriched, total, page, limit));
});

const received = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "You do not have an organisation profile.", { code: "NO_ORG" });
  const { limit, page, skip } = parsePaging(req);
  const oppIds = (await Opportunity.find({ organizationId: org._id }).select("_id")).map((o) => o._id);
  const filter = { opportunityId: { $in: oppIds } };
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);
  const enriched = await Promise.all(items.map(loadRelations));
  res.json(paginate(enriched, total, page, limit));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, hoursLogged } = req.body;
  const app = await Application.findById(req.params.id);
  if (!app) throw new ApiError(404, "Application not found.");
  const org = await getOwnedOrg(req.user._id);
  const opp = await Opportunity.findById(app.opportunityId);
  const isOrgOwner = org && opp && String(org._id) === String(opp.organizationId);
  if (!isOrgOwner && req.user.role !== "admin") throw new ApiError(403, "Only the organisation can update this application.");
  if (!["pending", "accepted", "rejected", "completed"].includes(status)) throw new ApiError(400, "Invalid status.");
  const allowedNext = { pending: ["accepted", "rejected"], accepted: ["completed", "rejected"], rejected: [], completed: [] };
  if (status !== app.status && !allowedNext[app.status]?.includes(status)) {
    throw new ApiError(409, `An application cannot move from ${app.status} to ${status}.`, { code: "INVALID_STATUS_TRANSITION" });
  }
  if (status === "accepted" && app.status !== "accepted" && opp) {
    const slotUpdate = await Opportunity.updateOne(
      { _id: opp._id, status: "open", $expr: { $lt: ["$filledSlots", "$slots"] } },
      { $inc: { filledSlots: 1 } }
    );
    if (slotUpdate.modifiedCount !== 1) throw new ApiError(409, "This opportunity has no remaining places.");
  }
  if (status === "rejected" && app.status === "accepted" && opp) {
    await Opportunity.updateOne({ _id: opp._id, filledSlots: { $gt: 0 } }, { $inc: { filledSlots: -1 } });
  }
  app.status = status;
  if (note !== undefined) app.note = note;
  if (hoursLogged !== undefined) {
    const logged = Number(hoursLogged);
    if (!Number.isFinite(logged) || logged < 0 || logged > 1000) throw new ApiError(400, "Hours logged must be between 0 and 1000.");
    app.hoursLogged = logged;
  }
  await app.save();
  await notify(app.volunteerId, { title: "Application updated", body: `Your application is now ${status}.`, type: "application", link: "/dashboard" });
  res.json(await loadRelations(app));
});

module.exports = { apply, mine, received, updateStatus };