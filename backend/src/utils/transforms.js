const { cleanDoc } = require("./index");

const refId = (value) => {
  if (!value) return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

/** Public-safe user object for /auth/me and auth responses. */
const toPublicUser = (user) => {
  if (!user) return null;
  const obj = cleanDoc(user);
  return {
    id: obj.id,
    _id: obj._id,
    email: obj.email,
    fullName: obj.fullName,
    full_name: obj.fullName,
    name: obj.fullName,
    phone: obj.phone,
    location: obj.location,
    role: obj.role,
    careconnectRole: obj.careconnectRole,
    careconnect_role: obj.careconnectRole,
    organizationName: obj.organizationName,
    organization_name: obj.organizationName,
    isVerified: obj.isVerified,
    is_verified: obj.isVerified,
    isPhoneVerified: obj.isPhoneVerified,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

/** Admin user row. */
const toAdminUser = (user) => {
  const obj = cleanDoc(user);
  return {
    id: obj.id,
    _id: obj._id,
    fullName: obj.fullName,
    name: obj.fullName,
    email: obj.email,
    role: obj.role === "admin" ? "admin" : obj.careconnectRole || "donor",
    careconnectRole: obj.careconnectRole,
    phone: obj.phone,
    location: obj.location,
    isVerified: obj.isVerified,
    emailVerified: obj.isVerified,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

const toOrganization = (org, { requirementsCount } = {}) => {
  if (!org) return null;
  const obj = cleanDoc(org);
  return {
    id: obj.id,
    _id: obj._id,
    name: obj.name,
    organizationName: obj.name,
    description: obj.description,
    location: obj.location || [obj.city, obj.state].filter(Boolean).join(", "),
    city: obj.city,
    state: obj.state,
    email: obj.email,
    contactEmail: obj.email,
    phone: obj.phone,
    verificationStatus: obj.verificationStatus,
    status: obj.verificationStatus,
    verified: obj.verificationStatus === "approved",
    verificationReason: obj.verificationReason,
    verificationDocuments: obj.verificationDocuments,
    featured: obj.featured,
    imageUrl: obj.imageUrl,
    requirementsCount: typeof requirementsCount === "number" ? requirementsCount : undefined,
    ownerId: obj.ownerId,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

const toRequirement = (req, { organization } = {}) => {
  if (!req) return null;
  const obj = cleanDoc(req);
  return {
    id: obj.id,
    _id: obj._id,
    organizationId: refId(obj.organizationId),
    organization_id: refId(obj.organizationId),
    organization: organization ? { id: organization.id, name: organization.name } : undefined,
    organizationName: organization ? organization.name : undefined,
    title: obj.title,
    description: obj.description,
    category: obj.category,
    priority: obj.priority,
    quantity: obj.quantity,
    requiredQuantity: obj.quantity,
    unit: obj.unit,
    fulfilledQuantity: obj.fulfilledQuantity,
    fulfilled_quantity: obj.fulfilledQuantity,
    receivedQuantity: obj.fulfilledQuantity,
    dueDate: obj.dueDate,
    due_date: obj.dueDate,
    deadline: obj.dueDate,
    status: obj.status,
    active: obj.active,
    progress: obj.progress,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

const toDonation = (don, { donor, organization, requirement } = {}) => {
  if (!don) return null;
  const obj = cleanDoc(don);
  return {
    id: obj.id,
    _id: obj._id,
    donorId: obj.donorId,
    donor: donor ? { id: donor.id, fullName: donor.fullName, email: donor.email } : undefined,
    donorName: donor ? donor.fullName : undefined,
    organizationId: obj.organizationId,
    organization: organization ? { id: organization.id, name: organization.name } : undefined,
    organizationName: organization ? organization.name : undefined,
    requirementId: obj.requirementId,
    requirement: requirement ? { id: requirement.id, title: requirement.title } : undefined,
    requirementTitle: requirement ? requirement.title : undefined,
    type: obj.type,
    amount: obj.amount,
    quantity: obj.quantity,
    unit: obj.unit,
    note: obj.note,
    status: obj.status,
    receiptUrl: obj.receiptUrl,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

const toOpportunity = (opp, { organization } = {}) => {
  if (!opp) return null;
  const obj = cleanDoc(opp);
  return {
    id: obj.id,
    _id: obj._id,
    organizationId: refId(obj.organizationId),
    organization_id: refId(obj.organizationId),
    organization: organization ? { id: organization.id, name: organization.name } : undefined,
    organizationName: organization ? organization.name : undefined,
    title: obj.title,
    description: obj.description,
    location: obj.location,
    city: obj.city,
    state: obj.state,
    category: obj.category,
    date: obj.date,
    endDate: obj.endDate,
    slots: obj.slots,
    filledSlots: obj.filledSlots,
    status: obj.status,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

const toApplication = (app, { opportunity, volunteer, organization } = {}) => {
  if (!app) return null;
  const obj = cleanDoc(app);
  return {
    id: obj.id,
    _id: obj._id,
    opportunityId: obj.opportunityId,
    opportunity: opportunity ? { id: opportunity.id, title: opportunity.title } : undefined,
    opportunityTitle: opportunity ? opportunity.title : undefined,
    volunteerId: obj.volunteerId,
    volunteer: volunteer ? { id: volunteer.id, fullName: volunteer.fullName, email: volunteer.email } : undefined,
    volunteerName: volunteer ? volunteer.fullName : undefined,
    organizationId: refId(obj.organizationId),
    organization: organization ? { id: organization.id, name: organization.name } : undefined,
    organizationName: organization ? organization.name : undefined,
    message: obj.message,
    availability: obj.availability,
    status: obj.status,
    note: obj.note,
    hoursLogged: obj.hoursLogged,
    createdAt: obj.createdAt,
    created_date: obj.created_date,
  };
};

module.exports = {
  toPublicUser,
  toAdminUser,
  toOrganization,
  toRequirement,
  toDonation,
  toOpportunity,
  toApplication,
};