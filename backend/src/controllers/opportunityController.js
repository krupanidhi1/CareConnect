const Opportunity = require("../models/Opportunity");
const Organization = require("../models/Organization");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toOpportunity } = require("../utils/transforms");
const { getOwnedOrg } = require("./organizationController");

const enrich = (o) => toOpportunity(o, { organization: o.organizationId });

const list = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const approvedOrganizations = await Organization.find({ verificationStatus: "approved" }).distinct("_id");
  const filter = { status: "open", organizationId: { $in: approvedOrganizations } };
  if (req.query.location) {
    const loc = req.query.location;
    filter.$or = [{ city: new RegExp(loc, "i") }, { state: new RegExp(loc, "i") }, { location: new RegExp(loc, "i") }];
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const [items, total] = await Promise.all([
    Opportunity.find(filter).populate("organizationId").sort({ date: 1, createdAt: -1 }).skip(skip).limit(limit),
    Opportunity.countDocuments(filter),
  ]);
  res.json(paginate(items.map(enrich), total, page, limit));
});

const detail = asyncHandler(async (req, res) => {
  const opp = await Opportunity.findById(req.params.id).populate("organizationId");
  if (!opp || opp.status !== "open" || !opp.organizationId || opp.organizationId.verificationStatus !== "approved") {
    throw new ApiError(404, "Verified open opportunity not found.");
  }
  res.json(enrich(opp));
});

const mine = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "You do not have an organisation profile.", { code: "NO_ORG" });
  const items = await Opportunity.find({ organizationId: org._id }).populate("organizationId").sort({ createdAt: -1 });
  res.json(items.map(enrich));
});

const create = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(403, "Only organisations can publish opportunities.", { code: "NO_ORG" });
  if (org.verificationStatus !== "approved") throw new ApiError(403, "Your organisation must be verified before publishing opportunities.", { code: "ORG_NOT_VERIFIED" });
  const { title, description, location, city, state, date, endDate, slots, category } = req.body;
  if (typeof title !== "string" || title.trim().length < 4) throw new ApiError(400, "Opportunity title must be at least 4 characters.");
  if (typeof description !== "string" || description.trim().length < 10) throw new ApiError(400, "Opportunity description must be at least 10 characters.");
  const parsedSlots = Number(slots);
  if (!Number.isInteger(parsedSlots) || parsedSlots < 1 || parsedSlots > 500) throw new ApiError(400, "Volunteer places must be between 1 and 500.");
  const opp = await Opportunity.create({
    organizationId: org._id,
    title: title.trim(),
    description: description.trim(),
    location: location || "",
    city: city || "",
    state: state || "",
    date: date || null,
    endDate: endDate || null,
    slots: parsedSlots,
    category: category || "General",
  });
  await opp.populate("organizationId");
  res.status(201).json(enrich(opp));
});

const update = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) throw new ApiError(404, "Opportunity not found.");
  if (!org || String(org._id) !== String(opp.organizationId)) {
    if (req.user.role !== "admin") throw new ApiError(403, "You can only edit your own opportunities.");
  }
  const allowed = ["title", "description", "location", "city", "state", "date", "endDate", "slots", "category", "status"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) opp[k] = req.body[k];
  });
  await opp.save();
  await opp.populate("organizationId");
  res.json(enrich(opp));
});

const remove = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  const opp = await Opportunity.findById(req.params.id);
  if (!opp) throw new ApiError(404, "Opportunity not found.");
  if (!org || String(org._id) !== String(opp.organizationId)) {
    if (req.user.role !== "admin") throw new ApiError(403, "You can only delete your own opportunities.");
  }
  opp.status = "closed";
  await opp.save();
  res.json({ message: "Opportunity closed." });
});

module.exports = { list, detail, mine, create, update, remove };