import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HandHeart, IndianRupee, Clock, PackageCheck, ArrowRight, Download, Inbox } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { donationsApi, organizationsApi, requirementsApi } from "@/api/careconnect";
import { displayName } from "@/lib/roles";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import DataTable from "@/components/common/DataTable";
import StatusPill from "@/components/common/StatusPill";
import RequirementCard from "@/components/site/RequirementCard";
import OrganizationCard from "@/components/site/OrganizationCard";
import OrganizationDialog from "@/components/site/OrganizationDialog";
import DonationDialog from "@/components/dashboard/DonationDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const isDone = (status) => ["fulfilled", "completed", "delivered"].includes(String(status).toLowerCase());

export default function DonorDashboard({ user }) {
  const donations = useApiResource(() => donationsApi.mine({ limit: 100 }));
  const needs = useApiResource(() => requirementsApi.list({ status: "active", limit: 3 }));
  const homes = useApiResource(() => organizationsApi.list({ verified: true, limit: 3 }));

  const [donating, setDonating] = useState(null);
  const [viewing, setViewing] = useState(null);

  const rows = Array.isArray(donations.data) ? donations.data : donations.data?.items || [];
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pending = rows.filter((row) => String(row.status).toLowerCase() === "pending").length;
  const completed = rows.filter((row) => isDone(row.status)).length;

  const activeNeeds = Array.isArray(needs.data) ? needs.data : needs.data?.items || [];
  const suggestedHomes = Array.isArray(homes.data) ? homes.data : homes.data?.items || [];

  const columns = [
    {
      key: "requirement",
      header: "Requirement",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.requirementTitle || row.requirement?.title || "Contribution"}</p>
          <p className="text-xs text-muted-foreground">{row.organizationName || row.organization?.name || "—"}</p>
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
      key: "date",
      header: "Date",
      render: (row) =>
        row.createdAt || row.created_date
          ? new Date(row.createdAt || row.created_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
          : "—",
    },
    {
      key: "receipt",
      header: "",
      render: (row) =>
        row.receiptUrl ? (
          <a
            href={row.receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Receipt
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  const table = (filtered) => (
    <DataTable
      columns={columns}
      rows={filtered}
      loading={donations.loading}
      empty={
        <EmptyState
          icon={Inbox}
          title="No contributions yet"
          description="Choose a requirement below and your contribution will be tracked here from pending to delivered."
        />
      }
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Donor dashboard"
        title={`Welcome back, ${displayName(user)}`}
        description="Your giving history, open requirements and homes that could use your help."
        actions={
          <Button asChild className="rounded-full">
            <Link to="/explore-homes">
              Browse requirements
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={HandHeart} label="Total donations" value={donations.configured ? rows.length : "—"} loading={donations.loading} hint="Recorded by the backend" />
        <StatCard icon={IndianRupee} label="Amount pledged" value={donations.configured ? `₹${totalAmount.toLocaleString()}` : "—"} loading={donations.loading} tone="accent" />
        <StatCard icon={Clock} label="Pending" value={donations.configured ? pending : "—"} loading={donations.loading} tone="warm" />
        <StatCard icon={PackageCheck} label="Completed" value={donations.configured ? completed : "—"} loading={donations.loading} tone="quiet" />
      </div>

      <section className="mt-9">
        <h2 className="font-heading text-xl text-foreground">Your contributions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Status is reported by the old age home and confirmed by the API.
        </p>

        <div className="mt-4">
          {!donations.configured ? (
            <ApiSection
              resource={donations}
              endpoints={["GET /donations/mine"]}
              noticeTitle="Donation history loads from your API"
              noticeDescription="Every contribution you make will be listed here with the status the home has confirmed."
            />
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">{table(rows)}</TabsContent>
              <TabsContent value="pending">
                {table(rows.filter((row) => String(row.status).toLowerCase() === "pending"))}
              </TabsContent>
              <TabsContent value="completed">{table(rows.filter((row) => isDone(row.status)))}</TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-xl text-foreground">Active requirements</h2>
          <Button asChild variant="ghost" className="rounded-full text-primary">
            <Link to="/explore-homes">View all</Link>
          </Button>
        </div>
        <div className="mt-4">
          <ApiSection
            resource={needs}
            endpoints={["GET /public/requirements"]}
            noticeTitle="Open requirements load from your API"
            noticeDescription="Publish requirements from an organisation account and they appear here for donors."
          >
            {() =>
              activeNeeds.length === 0 ? (
                <EmptyState icon={PackageCheck} title="No open requirements" description="Nothing needs support right now. Check back soon." />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {activeNeeds.map((need) => (
                    <RequirementCard key={need.id || need._id} requirement={need} onDonate={setDonating} />
                  ))}
                </div>
              )
            }
          </ApiSection>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-xl text-foreground">Recommended homes</h2>
        <div className="mt-4">
          <ApiSection
            resource={homes}
            endpoints={["GET /public/organizations?verified=true&limit=3"]}
            noticeTitle="Recommended homes load from your API"
            noticeDescription="Verified organisations with the most urgent needs will be suggested here."
          >
            {() =>
              suggestedHomes.length === 0 ? (
                <EmptyState icon={Inbox} title="No verified homes yet" description="Approved organisations will appear here." />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {suggestedHomes.map((home) => (
                    <OrganizationCard key={home.id || home._id} organization={home} onView={setViewing} />
                  ))}
                </div>
              )
            }
          </ApiSection>
        </div>
      </section>

      <DonationDialog
        requirement={donating}
        open={Boolean(donating)}
        onOpenChange={(next) => !next && setDonating(null)}
        onCreated={donations.refresh}
      />
      <OrganizationDialog organization={viewing} open={Boolean(viewing)} onOpenChange={(next) => !next && setViewing(null)} />
    </>
  );
}