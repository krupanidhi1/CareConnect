import React, { useState } from "react";
import { PackagePlus, Pencil, Trash2, Building2, HandHeart, Clock, PackageCheck, ShieldCheck, AlertTriangle, Users } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { donationsApi, organizationsApi, requirementsApi, opportunitiesApi, applicationsApi } from "@/api/careconnect";
import { displayName } from "@/lib/roles";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import StatusPill from "@/components/common/StatusPill";
import RequirementBar from "@/components/common/RequirementBar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RequirementFormDialog from "@/components/dashboard/RequirementFormDialog";
import OpportunityFormDialog from "@/components/dashboard/OpportunityFormDialog";
import OrganizationVerificationDialog from "@/components/dashboard/OrganizationVerificationDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const APPLICATION_TRANSITIONS = {
  pending: ["pending", "accepted", "rejected"],
  accepted: ["accepted", "completed", "rejected"],
  rejected: ["rejected"],
  completed: ["completed"],
};

const STATUS_TRANSITIONS = {
  pending: ["pending", "confirmed", "cancelled"],
  confirmed: ["confirmed", "in_transit", "delivered", "cancelled"],
  in_transit: ["in_transit", "delivered", "cancelled"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

export default function OrganizationDashboard({ user }) {
  const org = useApiResource(() => organizationsApi.mine());
  const requirements = useApiResource(() => requirementsApi.mine());
  const donations = useApiResource(() => donationsApi.received({ limit: 100 }));
  const opportunities = useApiResource(() => opportunitiesApi.mine());
  const applications = useApiResource(() => applicationsApi.received({ limit: 100 }));

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [opportunityOpen, setOpportunityOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);

  const orgData = org.data || {};
  const rows = Array.isArray(requirements.data) ? requirements.data : requirements.data?.items || [];
  const gifts = Array.isArray(donations.data) ? donations.data : donations.data?.items || [];
  const opportunityRows = Array.isArray(opportunities.data) ? opportunities.data : opportunities.data?.items || [];
  const applicationRows = Array.isArray(applications.data) ? applications.data : applications.data?.items || [];
  const active = rows.filter((row) => row.active !== false && ["open", "partial"].includes(String(row.status || "open").toLowerCase())).length;
  const pendingGifts = gifts.filter((gift) => String(gift.status).toLowerCase() === "pending").length;
  const completedGifts = gifts.filter((gift) => String(gift.status).toLowerCase() === "delivered").length;
  const verification = orgData.verificationStatus || (orgData.verified ? "approved" : "unverified");
  const isVerified = ["approved", "verified"].includes(String(verification).toLowerCase());

  const remove = async () => {
    setBusy(true);
    try {
      await requirementsApi.remove(deleting.id || deleting._id);
      toast({ title: "Requirement deleted", description: "The backend confirmed the deletion." });
      setDeleting(null);
      requirements.refresh();
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (donation, status) => {
    try {
      await donationsApi.updateStatus(donation.id || donation._id, { status });
      toast({ title: "Status updated", description: `Donation marked ${status.replace("_", " ")}.` });
      donations.refresh();
    } catch (error) {
      toast({ title: "Could not update", description: error.message, variant: "destructive" });
    }
  };

  const closeOpportunity = async (opportunity) => {
    try {
      await opportunitiesApi.update(opportunity.id || opportunity._id, { status: "closed" });
      toast({ title: "Opportunity closed", description: "It will no longer accept new applications." });
      opportunities.refresh();
    } catch (error) {
      toast({ title: "Could not close opportunity", description: error.message, variant: "destructive" });
    }
  };

  const updateApplication = async (application, status) => {
    try {
      await applicationsApi.updateStatus(application.id || application._id, { status });
      toast({ title: "Application updated", description: `Application marked ${status}.` });
      applications.refresh();
    } catch (error) {
      toast({ title: "Could not update application", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Organisation dashboard"
        title={orgData.name || user?.organization_name || displayName(user)}
        description="Publish requirements, track contributions and keep your verification up to date."
        actions={
          <>
            {!isVerified && (
              <Button variant="outline" className="rounded-full" onClick={() => setVerificationOpen(true)}>
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                {verification === "pending" ? "Update verification" : "Submit verification"}
              </Button>
            )}
            <Button variant="outline" className="rounded-full" onClick={() => setOpportunityOpen(true)} disabled={!isVerified}>
              Volunteer opportunity
            </Button>
            <Button className="rounded-full" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <PackagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
              New requirement
            </Button>
          </>
        }
      />

      <div className="mt-6 rounded-2xl border border-border/70 bg-card px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Organisation verification</p>
              <p className="text-xs text-muted-foreground">
                {isVerified
                  ? "Your organisation is approved to receive support."
                  : verification === "pending"
                    ? "Your verification request is awaiting administrator review."
                    : "Submit your registration details for administrator review."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={verification} />
            {!isVerified && (
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setVerificationOpen(true)}>
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Verification details
              </Button>
            )}
          </div>
        </div>
        {verification === "rejected" && orgData.verificationReason && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/8 px-3.5 py-2.5 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {orgData.verificationReason}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={PackagePlus} label="Requirements" value={requirements.configured ? rows.length : "—"} loading={requirements.loading} />
        <StatCard icon={Clock} label="Active" value={requirements.configured ? active : "—"} loading={requirements.loading} tone="accent" />
        <StatCard icon={HandHeart} label="Donations received" value={donations.configured ? gifts.length : "—"} loading={donations.loading} tone="warm" />
        <StatCard icon={PackageCheck} label="Delivered" value={donations.configured ? completedGifts : "—"} loading={donations.loading} tone="quiet" hint={donations.configured ? `${pendingGifts} awaiting your review` : undefined} />
      </div>

      <Tabs defaultValue="requirements" className="mt-9">
        <TabsList>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="donations">Donations received</TabsTrigger>
          <TabsTrigger value="opportunities">Volunteer opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="mt-5">
          <ApiSection
            resource={requirements}
            endpoints={["GET /requirements/mine", "POST /requirements", "PATCH /requirements/:id", "DELETE /requirements/:id"]}
            noticeTitle="Your requirements load from your API"
            noticeDescription="Create, edit and delete requirements here once the CareConnect API is connected."
          >
            {() =>
              rows.length === 0 ? (
                <EmptyState
                  icon={PackagePlus}
                  title="No requirements published"
                  description="Publish what your home needs — donors can then contribute against it line by line."
                  action={<Button className="rounded-full" onClick={() => { setEditing(null); setFormOpen(true); }}>Publish your first requirement</Button>}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rows.map((row) => (
                    <article key={row.id || row._id} className="surface p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-heading text-lg text-foreground">{row.title}</p>
                          <p className="text-xs text-muted-foreground">{row.category} · {row.priority}</p>
                        </div>
                        <StatusPill status={row.status || "active"} />
                      </div>
                      {row.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{row.description}</p>
                      )}
                      <div className="mt-4">
                        <RequirementBar received={row.receivedQuantity} required={row.requiredQuantity} />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setEditing(row); setFormOpen(true); }}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => setDeleting(row)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            }
          </ApiSection>
        </TabsContent>

        <TabsContent value="donations" className="mt-5">
          <ApiSection
            resource={donations}
            endpoints={["GET /donations/received", "PATCH /donations/:id/status"]}
            noticeTitle="Received donations load from your API"
            noticeDescription="Accept contributions, mark them in progress and close them once delivered."
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
                        <p className="text-xs text-muted-foreground">{row.requirementTitle || row.requirement?.title || "—"}</p>
                      </div>
                    ),
                  },
                  {
                    key: "contribution",
                    header: "Contribution",
                    render: (row) =>
                      [row.quantity ? `${row.quantity} ${row.unit || ""}`.trim() : null, row.amount ? `₹${Number(row.amount).toLocaleString()}` : null]
                        .filter(Boolean)
                        .join(" · ") || "—",
                  },
                  { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
                  {
                    key: "actions",
                    header: "Update",
                    render: (row) => (
                      <select
                        className="h-9 rounded-lg border border-input bg-card px-2 text-xs capitalize text-foreground"
                        value={String(row.status || "pending").toLowerCase()}
                        onChange={(event) => changeStatus(row, event.target.value)}
                        aria-label="Update donation status"
                      >
                        {(STATUS_TRANSITIONS[String(row.status || "pending").toLowerCase()] || [row.status || "pending"]).map((status) => (
                          <option key={status} value={status}>{status.replace("_", " ")}</option>
                        ))}
                      </select>
                    ),
                  },
                ]}
                rows={gifts}
                loading={donations.loading}
                empty={<EmptyState icon={HandHeart} title="No donations yet" description="Contributions appear here as soon as a donor submits one." />}
              />
            )}
          </ApiSection>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-5">
          <ApiSection
            resource={opportunities}
            endpoints={["GET /opportunities/mine", "POST /opportunities", "PATCH /opportunities/:id"]}
            noticeTitle="Volunteer opportunities load from your API"
            noticeDescription="Publish activities for volunteers and close them when all places are filled or the activity has passed."
          >
            {() => opportunityRows.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No volunteer opportunities yet"
                description={isVerified ? "Publish an activity so volunteers can find and apply to help." : "Your organisation must be verified before publishing volunteer opportunities."}
                action={<Button className="rounded-full" disabled={!isVerified} onClick={() => setOpportunityOpen(true)}>Create opportunity</Button>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {opportunityRows.map((item) => (
                  <article key={item.id || item._id} className="surface p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-lg text-foreground">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{item.location} · {item.category || "General"}</p>
                      </div>
                      <StatusPill status={item.status || "open"} />
                    </div>
                    {item.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">{item.filledSlots || 0} of {item.slots || 0} places filled{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ""}</p>
                    {item.status === "open" && (
                      <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={() => closeOpportunity(item)}>Close opportunity</Button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </ApiSection>

          <div className="mt-8">
            <ApiSection
              resource={applications}
              endpoints={["GET /applications/received", "PATCH /applications/:id/status"]}
              noticeTitle="Volunteer applications load from your API"
              noticeDescription="Review applicants and update each application after checking the volunteer's message and availability."
            >
              {() => (
                <DataTable
                  columns={[
                    { key: "volunteer", header: "Volunteer", render: (row) => <div><p className="font-medium text-foreground">{row.volunteerName || row.volunteer?.fullName || "Volunteer"}</p><p className="text-xs text-muted-foreground">{row.volunteer?.email || ""}</p></div> },
                    { key: "opportunity", header: "Opportunity", render: (row) => row.opportunityTitle || row.opportunity?.title || "—" },
                    { key: "availability", header: "Availability", render: (row) => row.availability || "Not specified" },
                    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
                    { key: "action", header: "Review", render: (row) => (
                      <select
                        className="h-9 rounded-lg border border-input bg-card px-2 text-xs capitalize text-foreground"
                        value={String(row.status || "pending").toLowerCase()}
                        onChange={(event) => updateApplication(row, event.target.value)}
                        aria-label="Update volunteer application status"
                      >
                        {(APPLICATION_TRANSITIONS[String(row.status || "pending").toLowerCase()] || [row.status || "pending"]).map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    ) },
                  ]}
                  rows={applicationRows}
                  loading={applications.loading}
                  empty={<EmptyState icon={Users} title="No volunteer applications yet" description="Applications will appear here when volunteers apply to your published opportunities." />}
                />
              )}
            </ApiSection>
          </div>
        </TabsContent>
      </Tabs>

      <RequirementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        requirement={editing}
        onSaved={requirements.refresh}
      />

      <OpportunityFormDialog
        open={opportunityOpen}
        onOpenChange={setOpportunityOpen}
        onCreated={opportunities.refresh}
      />

      <OrganizationVerificationDialog
        open={verificationOpen}
        onOpenChange={setVerificationOpen}
        onSubmitted={org.refresh}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => !next && setDeleting(null)}
        title="Delete this requirement?"
        description="Donors will no longer see it. Existing donation records are not removed."
        busy={busy}
        onConfirm={remove}
      />
    </>
  );
}