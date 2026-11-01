import axios from "axios";

/**
 * CareConnect API client.
 *
 * The CareConnect Express + MongoDB backend is the single source of truth for
 * every record shown in this app. Nothing is mocked: when the API is not
 * reachable the UI shows a "backend not connected" state naming the endpoints
 * it is waiting for.
 *
 * Configure the base URL with VITE_CARECONNECT_API_URL (e.g.
 * https://api.careconnect.org/api). While developing locally you can also set
 * it once at runtime from the browser console:
 *   localStorage.setItem("careconnect.api_base_url", "http://localhost:5001/api")
 * and reload.
 */

const envBase = import.meta.env.VITE_CARECONNECT_API_URL || "";
const storedBase =
  typeof window !== "undefined"
    ? window.localStorage.getItem("careconnect.api_base_url") || ""
    : "";

export const API_BASE_URL = String(envBase || storedBase).trim().replace(/\/+$/, "");
export const isApiConfigured = () => API_BASE_URL.length > 0;

let accessToken = "";

export const tokenStore = {
  get() {
    try {
      return accessToken;
    } catch {
      return "";
    }
  },
  set(token) {
    try {
      accessToken = token;
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      accessToken = "";
    } catch {
      /* storage unavailable */
    }
  },
};

/**
 * Route contract expected from the CareConnect backend. One place to reconcile
 * with the Express router — nothing else in the app hardcodes a path.
 */
export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    updateProfile: "/auth/profile",
    verifyEmail: "/auth/verify-email",
    resendEmailOtp: "/auth/resend-email-otp",
    verifyPhone: "/auth/verify-phone",
    resendPhoneOtp: "/auth/resend-phone-otp",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
  },
  public: {
    stats: "/public/stats",
    featuredOrganizations: "/public/organizations/featured",
    urgentRequirements: "/public/requirements/urgent",
  },
  organizations: {
    list: "/public/organizations",
    mine: "/organizations/me",
    detail: (id) => `/public/organizations/${id}`,
    create: "/organizations",
    update: (id) => `/organizations/${id}`,
    submitVerification: "/organizations/me/verification",
  },
  requirements: {
    list: "/public/requirements",
    mine: "/requirements/mine",
    create: "/requirements",
    update: (id) => `/requirements/${id}`,
    remove: (id) => `/requirements/${id}`,
  },
  donations: {
    create: "/donations",
    mine: "/donations/mine",
    received: "/donations/received",
    list: "/donations",
    updateStatus: (id) => `/donations/${id}/status`,
  },
  opportunities: {
    list: "/opportunities",
    detail: (id) => `/opportunities/${id}`,
    create: "/opportunities",
    update: (id) => `/opportunities/${id}`,
    remove: (id) => `/opportunities/${id}`,
    mine: "/opportunities/mine",
  },
  applications: {
    apply: "/applications",
    mine: "/applications/mine",
    received: "/applications/received",
    updateStatus: (id) => `/applications/${id}/status`,
  },
  notifications: {
    list: "/notifications",
    read: (id) => `/notifications/${id}/read`,
    readAll: "/notifications/read-all",
  },
  admin: {
    stats: "/admin/stats",
    analytics: "/admin/analytics",
    users: "/admin/users",
    user: (id) => `/admin/users/${id}`,
    organizations: "/admin/organizations",
    reviewOrganization: (id) => `/admin/organizations/${id}/review`,
    donations: "/admin/donations",
    exportDonations: "/admin/reports/donations.csv",
  },
  contact: "/contact",
};

export class BackendNotConnectedError extends Error {
  constructor() {
    super("The CareConnect API is not connected yet.");
    this.name = "BackendNotConnectedError";
    this.code = "BACKEND_NOT_CONNECTED";
  }
}

export function normalizeError(error) {
  const status = error.response?.status;
  const payload = error.response?.data || {};
  const message =
    payload.message ||
    payload.error ||
    (status ? `Request failed with status ${status}.` : "Could not reach the CareConnect API.");
  const normalized = new Error(message);
  normalized.status = status;
  normalized.code = payload.code;
  normalized.details = payload.errors || payload.details || null;
  return normalized;
}

const http = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const isAuthCall = Object.values(ENDPOINTS.auth).some(
      (path) => typeof path === "string" && String(original.url || "").includes(path)
    );

    if (error.response?.status === 401 && !original.__retried && !isAuthCall) {
      original.__retried = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.auth.refresh}`,
          {},
          { withCredentials: true }
        );
        const token = data?.accessToken || data?.token || data?.data?.accessToken;
        if (!token) throw new Error("Refresh token rejected");
        tokenStore.set(token);
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` };
        return http(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new window.Event("careconnect:session-expired"));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

async function request({ method = "get", url, data, params, responseType }) {
  if (!isApiConfigured()) throw new BackendNotConnectedError();
  const response = await http.request({ method, url, data, params, responseType });
  const payload = response.data;
  if (payload && typeof payload === "object" && "data" in payload) return payload.data;
  return payload;
}

export const authApi = {
  register: (payload) => request({ method: "post", url: ENDPOINTS.auth.register, data: payload }),
  login: (payload) => request({ method: "post", url: ENDPOINTS.auth.login, data: payload }),
  logout: () => request({ method: "post", url: ENDPOINTS.auth.logout }),
  refresh: () => request({ method: "post", url: ENDPOINTS.auth.refresh, data: {} }),
  me: () => request({ url: ENDPOINTS.auth.me }),
  updateProfile: (payload) => request({ method: "patch", url: ENDPOINTS.auth.updateProfile, data: payload }),
  verifyEmail: (payload) => request({ method: "post", url: ENDPOINTS.auth.verifyEmail, data: payload }),
  resendEmailOtp: (payload) => request({ method: "post", url: ENDPOINTS.auth.resendEmailOtp, data: payload }),
  verifyPhone: (payload) => request({ method: "post", url: ENDPOINTS.auth.verifyPhone, data: payload }),
  resendPhoneOtp: (payload) => request({ method: "post", url: ENDPOINTS.auth.resendPhoneOtp, data: payload }),
  forgotPassword: (payload) => request({ method: "post", url: ENDPOINTS.auth.forgotPassword, data: payload }),
  resetPassword: (payload) => request({ method: "post", url: ENDPOINTS.auth.resetPassword, data: payload }),
  changePassword: (payload) => request({ method: "post", url: ENDPOINTS.auth.changePassword, data: payload }),
};

export const publicApi = {
  stats: () => request({ url: ENDPOINTS.public.stats }),
  featuredOrganizations: (params) =>
    request({ url: ENDPOINTS.public.featuredOrganizations, params }),
  urgentRequirements: (params) => request({ url: ENDPOINTS.public.urgentRequirements, params }),
};

export const organizationsApi = {
  list: (params) => request({ url: ENDPOINTS.organizations.list, params }),
  mine: () => request({ url: ENDPOINTS.organizations.mine }),
  detail: (id) => request({ url: ENDPOINTS.organizations.detail(id) }),
  create: (payload) => request({ method: "post", url: ENDPOINTS.organizations.create, data: payload }),
  update: (id, payload) => request({ method: "patch", url: ENDPOINTS.organizations.update(id), data: payload }),
  submitVerification: (payload) =>
    request({ method: "post", url: ENDPOINTS.organizations.submitVerification, data: payload }),
};

export const requirementsApi = {
  list: (params = {}) => {
    const normalized = { ...params };
    if (normalized.organizationId && !normalized.organization_id) {
      normalized.organization_id = normalized.organizationId;
      delete normalized.organizationId;
    }
    if (normalized.status === "active") delete normalized.status;
    return request({ url: ENDPOINTS.requirements.list, params: normalized });
  },
  mine: () => request({ url: ENDPOINTS.requirements.mine }),
  create: (payload) => request({ method: "post", url: ENDPOINTS.requirements.create, data: payload }),
  update: (id, payload) => request({ method: "patch", url: ENDPOINTS.requirements.update(id), data: payload }),
  remove: (id) => request({ method: "delete", url: ENDPOINTS.requirements.remove(id) }),
};

export const donationsApi = {
  create: (payload) => request({ method: "post", url: ENDPOINTS.donations.create, data: payload }),
  mine: (params) => request({ url: ENDPOINTS.donations.mine, params }),
  received: (params) => request({ url: ENDPOINTS.donations.received, params }),
  list: (params) => request({ url: ENDPOINTS.donations.list, params }),
  updateStatus: (id, payload) =>
    request({ method: "patch", url: ENDPOINTS.donations.updateStatus(id), data: payload }),
};

export const opportunitiesApi = {
  list: (params) => request({ url: ENDPOINTS.opportunities.list, params }),
  detail: (id) => request({ url: ENDPOINTS.opportunities.detail(id) }),
  create: (payload) => request({ method: "post", url: ENDPOINTS.opportunities.create, data: payload }),
  update: (id, payload) => request({ method: "patch", url: ENDPOINTS.opportunities.update(id), data: payload }),
  remove: (id) => request({ method: "delete", url: ENDPOINTS.opportunities.remove(id) }),
  mine: () => request({ url: ENDPOINTS.opportunities.mine }),
};

export const applicationsApi = {
  apply: (payload) => request({ method: "post", url: ENDPOINTS.applications.apply, data: payload }),
  mine: (params) => request({ url: ENDPOINTS.applications.mine, params }),
  received: (params) => request({ url: ENDPOINTS.applications.received, params }),
  updateStatus: (id, payload) =>
    request({ method: "patch", url: ENDPOINTS.applications.updateStatus(id), data: payload }),
};

export const notificationsApi = {
  list: () => request({ url: ENDPOINTS.notifications.list }),
  markRead: (id) => request({ method: "patch", url: ENDPOINTS.notifications.read(id) }),
  markAllRead: () => request({ method: "patch", url: ENDPOINTS.notifications.readAll }),
};

export const adminApi = {
  stats: () => request({ url: ENDPOINTS.admin.stats }),
  analytics: () => request({ url: ENDPOINTS.admin.analytics }),
  users: (params) => request({ url: ENDPOINTS.admin.users, params }),
  user: (id) => request({ url: ENDPOINTS.admin.user(id) }),
  organizations: (params) => request({ url: ENDPOINTS.admin.organizations, params }),
  reviewOrganization: (id, payload) =>
    request({ method: "patch", url: ENDPOINTS.admin.reviewOrganization(id), data: payload }),
  donations: (params) => request({ url: ENDPOINTS.admin.donations, params }),
  exportDonations: async () => {
    if (!isApiConfigured()) throw new BackendNotConnectedError();
    const response = await http.get(ENDPOINTS.admin.exportDonations, { responseType: "blob" });
    return response.data;
  },
};

export const contactApi = {
  create: (payload) => request({ method: "post", url: ENDPOINTS.contact, data: payload }),
};