import React from "react";
import { Building2, HandHeart, Users, PackageSearch } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { publicApi } from "@/api/careconnect";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImpactStrip() {
  const resource = useApiResource(() => publicApi.stats());
  const stats = resource.data || {};

  const items = [
    { label: "Verified old age homes", value: stats.verifiedOrganizations ?? stats.verifiedHomes, icon: Building2 },
    { label: "Donations recorded", value: stats.donations ?? stats.totalDonations, icon: HandHeart },
    { label: "Volunteers onboard", value: stats.volunteers ?? stats.totalVolunteers, icon: Users },
    { label: "Active requirements", value: stats.totalRequirements ?? stats.requirementCount, icon: PackageSearch },
  ];

  return (
    <section className="shell -mt-2">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/70 bg-border/60 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="bg-card px-5 py-6 sm:px-6">
            <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
            {resource.loading ? (
              <Skeleton className="mt-3 h-8 w-20" />
            ) : (
              <p className="mt-3 font-heading text-[1.7rem] leading-none tracking-tight text-foreground">
                {Number.isFinite(Number(item.value)) ? Number(item.value).toLocaleString() : "—"}
              </p>
            )}
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {resource.configured
          ? "Live figures reported by the CareConnect API."
          : "Live figures appear here once the CareConnect API is connected — nothing is estimated or filled in."}
      </p>
    </section>
  );
}