import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { resolveRole, ROLES } from "@/lib/roles";
import DonorDashboard from "@/pages/dashboard/DonorDashboard";
import OrganizationDashboard from "@/pages/dashboard/OrganizationDashboard";
import VolunteerDashboard from "@/pages/dashboard/VolunteerDashboard";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";

export default function DashboardHome() {
  const { user } = useAuth();
  const role = resolveRole(user);

  if (!role) return <Navigate to="/onboarding" replace />;
  if (role === ROLES.ADMIN) return <AdminDashboard user={user} />;
  if (role === ROLES.ORGANIZATION) return <OrganizationDashboard user={user} />;
  if (role === ROLES.VOLUNTEER) return <VolunteerDashboard user={user} />;
  return <DonorDashboard user={user} />;
}