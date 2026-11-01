const Organization = require("../models/Organization");
const Requirement = require("../models/Requirement");
const { ApiError, asyncHandler, parsePaging, paginate } = require("../utils");
const { toOrganization } = require("../utils/transforms");
const { notify } = require("../services/notificationService");

const getOwnedOrg = (userId) => Organization.findOne({ ownerId: userId });

const list = asyncHandler(async (req, res) => {
  const { limit, page, skip } = parsePaging(req);
  const filter = { verificationStatus: "approved" };
  if (req.query.verified) filter.verificationStatus = "approved";
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  if (req.query.location) {
    const loc = req.query.location;
    filter.$or = [{ city: new RegExp(loc, "i") }, { state: new RegExp(loc, "i") }, { location: new RegExp(loc, "i") }];
    delete filter.$text;
  }
  const [items, total] = await Promise.all([
    Organization.find(filter).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit),
    Organization.countDocuments(filter),
  ]);
  res.json(paginate(items.map(toOrganization), total, page, limit));
});

const mine = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "You do not have an organisation profile yet.", { code: "NO_ORG" });
  res.json(toOrganization(org));
});

const detail = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new ApiError(404, "Organisation not found.");
  if (req.user.role !== "admin" && String(org.ownerId) !== String(req.user._id)) {
    throw new ApiError(403, "You can only view your own organisation profile.");
  }
  const requirementsCount = await Requirement.countDocuments({ organizationId: org._id, active: true });
  res.json(toOrganization(org, { requirementsCount }));
});


const publicDetail = asyncHandler(async (req, res) => {
  const org = await Organization.findOne({ _id: req.params.id, verificationStatus: "approved" });
  if (!org) throw new ApiError(404, "Verified organisation not found.");
  const requirementsCount = await Requirement.countDocuments({
    organizationId: org._id,
    active: true,
    status: { $in: ["open", "partial"] },
  });
  res.json(toOrganization(org, { requirementsCount }));
});

const create = asyncHandler(async (req, res) => {
  const existing = await getOwnedOrg(req.user._id);
  if (existing) throw new ApiError(409, "You already have an organisation profile.");
  const org = await Organization.create({
    ...req.body,
    ownerId: req.user._id,
    email: req.body.email || req.user.email,
  });
  res.status(201).json(toOrganization(org));
});

const update = asyncHandler(async (req, res) => {
  const org = req.user.role === "admin"
    ? await Organization.findById(req.params.id)
    : await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "Organisation not found.", { code: "NO_ORG" });
  if (req.user.role !== "admin" && req.params.id && String(org._id) !== String(req.params.id)) {
    throw new ApiError(403, "You can only update your own organisation.");
  }
  const allowed = ["name", "description", "email", "phone", "location", "city", "state", "imageUrl"];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) org[k] = req.body[k];
  });
  await org.save();
  res.json(toOrganization(org));
});

const submitVerification = asyncHandler(async (req, res) => {
  const org = await getOwnedOrg(req.user._id);
  if (!org) throw new ApiError(404, "Organisation not found.", { code: "NO_ORG" });
  if (req.body.documents !== undefined) {
    if (!Array.isArray(req.body.documents) || req.body.documents.length < 1 || req.body.documents.length > 10 || req.body.documents.some((url) => typeof url !== "string" || !/^https:\/\//i.test(url))) {
      throw new ApiError(400, "Provide between 1 and 10 HTTPS document links.");
    }
    org.verificationDocuments = req.body.documents;
  }
  if (req.body.description !== undefined) {
    if (typeof req.body.description !== "string" || req.body.description.trim().length < 10 || req.body.description.length > 2000) {
      throw new ApiError(400, "Organisation description must be between 10 and 2000 characters.");
    }
    org.description = req.body.description.trim();
  }
  org.verificationStatus = "pending";
  await org.save();
  // notify platform admins
  const User = require("../models/User");
  const admins = await User.find({ role: "admin" });
  await Promise.all(admins.map((a) => notify(a._id, { title: "Verification request", body: `${org.name} submitted verification documents.`, type: "verification", link: "/dashboard" })));
  res.json(toOrganization(org));
});

module.exports = { list, mine, detail, publicDetail, create, update, submitVerification, getOwnedOrg };