const Requirement = require("../models/Requirement");
const { CATEGORIES, PRIORITIES } = require("../models/Requirement");
const Organization = require("../models/Organization");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toRequirement } = require("../utils/transforms");
const { getOwnedOrg } = require("./organizationController");

const enrich = (r) => toRequirement(r, { organization: r.organizationId });

const list = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = { active: true };
  if (req.query.organization_id) filter.organizationId = req.query.organization_id;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const [items, total] = await Promise.all([
    Requirement.find(filter).populate("organizationId").sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit),
    Requirement.countDocuments(filter),
  ]);
  res.json(paginate(items.map(enrich), total, page, limit));
});


const publicList = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const approved = await Organization.find({ verificationStatus: "approved" }).distinct("_id");
  const filter = {
    active: true,
    status: { $in: ["open", "partial"] },
    organizationId: { $in: approved },
  };
  if (req.query.organization_id) {
    filter.organizationId = { $in: approved, $eq: req.query.organization_id };
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const [items, total] = await Promise.all([
    Requirement.find(filter)
      .populate("organizationId")
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Requirement.countDocuments(filter),
  ]);
  res.json(paginate(items.map(enrich), total, page, limit));
});

const mine = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "You do not have an organisation profile.", { code: "NO_ORG" });
  const items = await Requirement.find({ organizationId: org._id }).populate("organizationId").sort({ createdAt: -1 });
  res.json(items.map(enrich));
});

const create = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(403, "Only organisations can publish requirements.", { code: "NO_ORG" });
  const { title, category, priority, quantity, unit, description, dueDate } = req.body;
  if (!title) throw new ApiError(400, "Title is required.");
  if (category && !CATEGORIES.includes(category)) throw new ApiError(400, "Invalid category.");
  if (priority && !PRIORITIES.includes(priority)) throw new ApiError(400, "Invalid priority.");
  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) throw new ApiError(400, "Requirement quantity must be greater than zero.");
  const requirement = await Requirement.create({
    organizationId: org._id,
    title,
    description: description || "",
    category: category || "Other",
    priority: priority || "medium",
    quantity: parsedQuantity,
    unit: unit || "",
    dueDate: dueDate || null,
  });
  await requirement.populate("organizationId");
  res.status(201).json(enrich(requirement));
});

const update = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  const requirement = await Requirement.findById(req.params.id);
  if (!requirement) throw new ApiError(404, "Requirement not found.");
  if (!org || String(org._id) !== String(requirement.organizationId)) {
    if (req.user.role !== "admin") throw new ApiError(403, "You can only edit your own requirements.");
  }
  if (req.body.quantity !== undefined && (!Number.isFinite(Number(req.body.quantity)) || Number(req.body.quantity) <= 0)) {
    throw new ApiError(400, "Requirement quantity must be greater than zero.");
  }
  const allowed = ["title", "description", "category", "priority", "quantity", "unit", "dueDate", "status", "active"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) requirement[k] = req.body[k];
  });
  await requirement.save();
  await requirement.populate("organizationId");
  res.json(enrich(requirement));
});

const remove = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  const requirement = await Requirement.findById(req.params.id);
  if (!requirement) throw new ApiError(404, "Requirement not found.");
  if (!org || String(org._id) !== String(requirement.organizationId)) {
    if (req.user.role !== "admin") throw new ApiError(403, "You can only delete your own requirements.");
  }
  requirement.active = false;
  await requirement.save();
  res.json({ message: "Requirement removed." });
});

module.exports = { list, publicList, mine, create, update, remove };