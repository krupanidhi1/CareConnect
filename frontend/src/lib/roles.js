export const ROLES = {
  DONOR: "donor",
  ORGANIZATION: "organization",
  VOLUNTEER: "volunteer",
  ADMIN: "admin",
};

export const ROLE_LABEL = {
  donor: "Donor",
  organization: "Old age home",
  volunteer: "Volunteer",
  admin: "Administrator",
};

/**
 * Role is decided once during onboarding and stored on the account.
 * Administrators are recognised by the platform-level admin role.
 */
export function resolveRole(user) {
  if (!user) return null;
  if (user.role === "admin") return ROLES.ADMIN;
  return [ROLES.DONOR, ROLES.ORGANIZATION, ROLES.VOLUNTEER].includes(user.careconnect_role)
    ? user.careconnect_role
    : null;
}

export function displayName(user) {
  return user?.full_name || user?.email?.split("@")[0] || "there";
}

export const CATEGORIES = [
  "Food",
  "Clothing",
  "Medicines",
  "Healthcare",
  "Education",
  "Furniture",
  "Financial Support",
  "Other",
];

export const PRIORITIES = ["low", "medium", "high", "urgent"];