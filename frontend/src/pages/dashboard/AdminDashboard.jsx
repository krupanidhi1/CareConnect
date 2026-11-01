import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  HandHeart,
  PackageSearch,
  ShieldCheck,
  Clock,
  Download,
  Search,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useApiResource from "@/hooks/useApiResource";
import { adminApi } from "@/api/careconnect";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import StatusPill from "@/components/common/StatusPill";
import BackendNotice from "@/components/common/BackendNotice";
import ErrorState from "@/components/common/ErrorState";
import ReviewOrganizationDialog from "@/components/dashboard/ReviewOrganizationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const asList = (payload) => (Array.isArray(payload) ? payload : payload?.items || []);

export default function AdminDashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const stats = useApiResource(() => adminApi.stats());
  const users = useApiResource(() => adminApi.users({ search: search || undefined, limit: 50 }), [search]);
  const organizations = useApiResource(() => adminApi.organizations({ limit: 50 }));
  const donations = useApiResource(() => adminApi.donations({ limit: 100 }));
  const analytics = useApiResource(() => adminApi.analytics());

  const s = stats.data || {};
  const userRows = asList(users.data);
  const orgRows = asList(organizations.data);
  const donationRows = asList(donations.data);
  const pendingOrgs = orgRows.filter((org) =>
    ["pending", "unverified", "awaiting"].includes(String(org.verificationStatus || org.status).toLowerCase())
  );
  const monthly = analytics.data?.monthlyDonations || [];
  const registrations = analytics.data?.registrationTrend || analytics.data?.userGrowth || [];

  const exportDonations = async () => {
    setExporting(true);
    try {
      const blob = await adminApi.exportDonations();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "careconnect-donations.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Export failed", description: error.message || "The report could not be downloaded.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="Verification requests, donations and account activity across CareConnect."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={exportDonations}
            disabled={exporting || !donations.configured}
          >
            {exporting ? <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <Download className="mr-2 h-4 w-4" aria-hidden="true" />}
            {exporting ? "Exporting…" : "Export donations"}
          </Button>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={s.totalUsers ?? "—"} loading={stats.loading} />
        <StatCard icon={HandHeart} label="Donors" value={s.donors ?? "—"} loading={stats.loading} tone="accent" />
        <StatCard icon={Building2} label="Organisations" value={s.organizations ?? "—"} loading={stats.loading} tone="warm" />
        <StatCard icon={Users} label="Volunteers" value={s.volunteers ?? "—"} loading={stats.loading} tone="quiet" />
        <StatCard icon={ShieldCheck} label="Verified homes" value={s.verifiedOrganizations ?? "—"} loading={stats.loading} />
        <StatCard icon={Clock} label="Pending verification" value={s.pendingOrganizations ?? "—"} loading={stats.loading} tone="warm" />
        <StatCard icon={HandHeart} label="Total donations" value={s.totalDonations ?? "—"} loading={stats.loading} tone="accent" />
        <StatCard icon={PackageSearch} label="Requirements" value={s.totalRequirements ?? "—"} loading={stats.loading} tone="quiet" />
      </div>

      <Tabs defaultValue="verification" className="mt-9">
        <TabsList className="flex-wrap">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organisations</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="mt-5">
          <ApiSection
            resource={organizations}
            endpoints={["GET /admin/organizations", "PATCH /admin/organizations/:id/review"]}
            noticeTitle="Verification queue loads from your API"
            noticeDescription="Review submitted documents, then approve or reject each organisation with a reason."
          >
            {() =>
              pendingOrgs.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="Nothing waiting for review"
                  description="New organisation registrations will appear here for verification."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingOrgs.map((org) => (
                    <article key={org.id || org._id} className="surface p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-heading text-lg text-foreground">{org.name || org.organizationName}</p>
                          <p className="text-xs text-muted-foreground">
                            {[org.city, org.state].filter(Boolean).join(", ") || org.location || "—"}
                          </p>
                        </div>
                        <StatusPill status={org.verificationStatus || org.status || "pending"} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{org.description || "No description submitted."}</p>
                      <Button className="mt-4 rounded-full" size="sm" onClick={() => setReviewing(org)}>
                        Review organisation
                      </Button>
                    </article>
                  ))}
                </div>
              )
            }
          </ApiSection>
        </TabsContent>

        <TabsContent value="users" className="mt-5">
          <div className="mb-4 relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search users"
              className="h-11 pl-10"
            />
          </div>
          <ApiSection
            resource={users}
            endpoints={["GET /admin/users?search"]}
            noticeTitle="User directory loads from your API"
            noticeDescription="Search and review accounts, roles and verification state from the admin endpoint."
          >
            {() => (
              <DataTable
                columns={[
                  {
                    key: "name",
                    header: "Account",
                    render: (row) => (
                      <div>
                        <p className="font-medium text-foreground">{row.fullName || row.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </div>
                    ),
                  },
                  { key: "role", header: "Role", render: (row) => <span className="capitalize">{row.role || "donor"}</span> },
                  { key: "phone", header: "Phone", render: (row) => row.phone || "—" },
                  {
                    key: "verified",
                    header: "Verified",
                    render: (row) => <StatusPill status={row.isVerified ?? row.emailVerified ? "verified" : "pending"} />,
                  },
                  {
                    key: "joined",
                    header: "Joined",
                    render: (row) =>
                      row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
                        : "—",
                  },
                ]}
                rows={userRows}
                loading={users.loading}
                empty={<EmptyState icon={Users} title="No accounts found" description="Try a different search term." />}
              />
            )}
          </ApiSection>
        </TabsContent>

        <TabsContent value="organizations" className="mt-5">
          <ApiSection
            resource={organizations}
            endpoints={["GET /admin/organizations"]}
            noticeTitle="Organisations load from your API"
            noticeDescription="Every registered home with its verification state and contact details."
          >
            {() => (
              <DataTable
                columns={[
                  {
                    key: "name",
                    header: "Organisation",
                    render: (row) => (
                      <div>
                        <p className="font-medium text-foreground">{row.name || row.organizationName}</p>
                        <p className="text-xs text-muted-foreground">{[row.city, row.state].filter(Boolean).join(", ") || "—"}</p>
                      </div>
                    ),
                  },
                  { key: "contact", header: "Contact", render: (row) => row.email || row.contactEmail || "—" },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => <StatusPill status={row.verificationStatus || row.status} />,
                  },
                  {
                    key: "review",
                    header: "",
                    render: (row) => (
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setReviewing(row)}>
                        Review
                      </Button>
                    ),
                  },
                ]}
                rows={orgRows}
                loading={organizations.loading}
                empty={<EmptyState icon={Building2} title="No organisations yet" description="Registered homes appear here." />}
              />
            )}
          </ApiSection>
        </TabsContent>

        <TabsContent value="donations" className="mt-5">
          <ApiSection
            resource={donations}
            endpoints={["GET /admin/donations"]}
            noticeTitle="Donation ledger loads from your API"
            noticeDescription="Monitor every contribution and its current lifecycle status."
          >
            {() => (
              <DataTable
                columns={[
                  {
                    key: "donor",
                    header: "Donor",
                    render: (row) => (
                      <div>
                        <p className="font-medium text-foreground">{row.donorName || row.donor?.fullName || "Donor"}</p>
                        <p className="text-xs text-muted-foreground">{row.organizationName || row.organization?.name || "—"}</p>
                      </div>
                    ),
                  },
                  { key: "requirement", header: "Requirement", render: (row) => row.requirementTitle || row.requirement?.title || "—" },
                  {
                    key: "value",
                    header: "Value",
                    render: (row) =>
                      [row.quantity ? `${row.quantity} ${row.unit || ""}`.trim() : null, row.amount ? `₹${Number(row.amount).toLocaleString()}` : null]
                        .filter(Boolean)
                        .join(" · ") || "—",
                  },
                  { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
                  {
                    key: "date",
                    header: "Date",
                    render: (row) =>
                      row.createdAt ? new Date(row.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—",
                  },
                ]}
                rows={donationRows}
                loading={donations.loading}
                empty={<EmptyState icon={HandHeart} title="No donations recorded" description="Contributions appear here as donors submit them." />}
              />
            )}
          </ApiSection>
        </TabsContent>

        <TabsContent value="analytics" className="mt-5 space-y-5">
          {!analytics.configured ? (
            <BackendNotice
              endpoints={["GET /admin/analytics"]}
              title="Charts load from your API"
              noticeDescription="Monthly contribution and registration trends are charted from the numbers your backend reports."
            />
          ) : analytics.error ? (
            <ErrorState error={analytics.error} onRetry={analytics.refresh} />
          ) : (
            <>
              <div className="surface p-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" aria-hidden="true" />
                  <h3 className="font-heading text-lg text-foreground">Monthly contributions</h3>
                </div>
                <div className="mt-4 h-64">
                  {monthly.length === 0 ? (
                    <p className="grid h-full place-items-center text-sm text-muted-foreground">
                      No contribution records reported yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Bar dataKey="total" name="Amount" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="surface p-5">
                <h3 className="font-heading text-lg text-foreground">Registration trend</h3>
                <div className="mt-4 h-64">
                  {registrations.length === 0 ? (
                    <p className="grid h-full place-items-center text-sm text-muted-foreground">
                      No registration history reported yet.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={registrations}>
                        <defs>
                          <linearGradient id="registrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                        <Area type="monotone" dataKey="count" name="New accounts" stroke="hsl(var(--accent))" fill="url(#registrations)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <ReviewOrganizationDialog
        organization={reviewing}
        open={Boolean(reviewing)}
        onOpenChange={(next) => !next && setReviewing(null)}
        onReviewed={organizations.refresh}
      />
    </>
  );
}