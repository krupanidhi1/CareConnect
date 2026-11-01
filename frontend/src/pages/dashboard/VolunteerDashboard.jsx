import React, { useState } from "react";
import { CalendarClock, MapPin, Users, CheckCircle2, Clock3, Send, Inbox, Search } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { applicationsApi, opportunitiesApi } from "@/api/careconnect";
import { displayName } from "@/lib/roles";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import StatusPill from "@/components/common/StatusPill";
import ApplyDialog from "@/components/dashboard/ApplyDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VolunteerDashboard({ user }) {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [applying, setApplying] = useState(null);

  const opportunities = useApiResource(
    () => opportunitiesApi.list({ category: category || undefined, location: location || undefined, limit: 9 }),
    [category, location]
  );
  const applications = useApiResource(() => applicationsApi.mine());

  const role_opportunities = Array.isArray(opportunities.data)
    ? opportunities.data
    : opportunities.data?.items || [];
  const applicationsList = Array.isArray(applications.data)
    ? applications.data
    : applications.data?.items || [];

  const accepted = applicationsList.filter((row) => String(row.status).toLowerCase() === "accepted").length;
  const completed = applicationsList.filter((row) => ["completed", "fulfilled"].includes(String(row.status).toLowerCase())).length;
  const hours = applicationsList.reduce((sum, row) => sum + Number(row.hoursLogged || row.hours || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Volunteer dashboard"
        title={`Hello, ${displayName(user)}`}
        description="Find opportunities near you, apply, and keep track of what you have contributed."
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Send} label="Applications" value={applications.configured ? applicationsList.length : "—"} loading={applications.loading} />
        <StatCard icon={CheckCircle2} label="Accepted" value={applications.configured ? accepted : "—"} loading={applications.loading} tone="accent" />
        <StatCard icon={CheckCircle2} label="Completed" value={applications.configured ? completed : "—"} loading={applications.loading} tone="quiet" />
        <StatCard icon={Clock3} label="Hours logged" value={applications.configured ? hours : "—"} loading={applications.loading} tone="warm" />
      </div>

      <Tabs defaultValue="opportunities" className="mt-9">
        <TabsList>
          <TabsTrigger value="opportunities">Find opportunities</TabsTrigger>
          <TabsTrigger value="applications">My applications</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-5">
          <div className="surface mb-4 flex flex-col gap-3 p-4 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="category" className="text-xs text-muted-foreground">Category</Label>
              <Input id="category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Teaching, cooking, care…" className="h-10" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="vol-location" className="text-xs text-muted-foreground">Location</Label>
              <Input id="vol-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or area" className="h-10" />
            </div>
          </div>

          <ApiSection
            resource={opportunities}
            endpoints={["GET /opportunities?category&location", "POST /applications"]}
            noticeTitle="Opportunities load from your API"
            noticeDescription="Published volunteer opportunities appear here with schedules, locations and the organisation behind them."
          >
            {() =>
              role_opportunities.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No opportunities match"
                  description="Try a different category or clear the location filter."
                  action={<Button variant="outline" className="rounded-full" onClick={() => { setCategory(""); setLocation(""); }}>Clear filters</Button>}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {role_opportunities.map((opportunity) => (
                    <article key={opportunity.id || opportunity._id} className="surface flex h-full flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-heading text-lg leading-snug text-foreground">{opportunity.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {opportunity.organizationName || opportunity.organization?.name || "Organisation"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                          {opportunity.category || "General"}
                        </span>
                      </div>

                      {opportunity.description && (
                        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>
                      )}

                      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                        {(opportunity.location || opportunity.city) && (
                          <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{opportunity.location || opportunity.city}</p>
                        )}
                        {(opportunity.date || opportunity.endDate) && (
                          <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />{new Date(opportunity.date || opportunity.endDate).toLocaleString()}</p>
                        )}
                        {opportunity.slots && (
                          <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" aria-hidden="true" />{opportunity.slots} volunteer places</p>
                        )}
                      </div>

                      <Button className="mt-5 w-full rounded-full" onClick={() => setApplying(opportunity)}>
                        Apply to volunteer
                      </Button>
                    </article>
                  ))}
                </div>
              )
            }
          </ApiSection>
        </TabsContent>

        <TabsContent value="applications" className="mt-5">
          <ApiSection
            resource={applications}
            endpoints={["GET /applications/mine"]}
            noticeTitle="Your applications load from your API"
            noticeDescription="Track every application and the status the organisation has set."
          >
            {() => (
              <DataTable
                columns={[
                  {
                    key: "opportunity",
                    header: "Opportunity",
                    render: (row) => (
                      <div>
                        <p className="font-medium text-foreground">{row.opportunityTitle || row.opportunity?.title || "Opportunity"}</p>
                        <p className="text-xs text-muted-foreground">{row.organizationName || row.organization?.name || "—"}</p>
                      </div>
                    ),
                  },
                  {
                    key: "applied",
                    header: "Applied",
                    render: (row) =>
                      row.createdAt || row.created_date
                        ? new Date(row.createdAt || row.created_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
                        : "—",
                  },
                  { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
                  {
                    key: "hours",
                    header: "Hours",
                    render: (row) => row.hoursLogged || row.hours || "—",
                  },
                ]}
                rows={applicationsList}
                loading={applications.loading}
                empty={
                  <EmptyState
                    icon={Inbox}
                    title="No applications yet"
                    description="Apply to an opportunity and it will appear here for tracking."
                  />
                }
              />
            )}
          </ApiSection>
        </TabsContent>
      </Tabs>

      <ApplyDialog
        opportunity={applying}
        open={Boolean(applying)}
        onOpenChange={(next) => !next && setApplying(null)}
        onApplied={applications.refresh}
      />
    </>
  );
}