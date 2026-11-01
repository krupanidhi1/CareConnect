import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { publicApi } from "@/api/careconnect";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import OrganizationCard from "@/components/site/OrganizationCard";
import OrganizationDialog from "@/components/site/OrganizationDialog";
import { Button } from "@/components/ui/button";

export default function FeaturedHomes() {
  const resource = useApiResource(() => publicApi.featuredOrganizations({ limit: 3 }));
  const [selected, setSelected] = useState(null);
  const homes = Array.isArray(resource.data) ? resource.data : resource.data?.items || [];

  return (
    <section className="shell mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Verified network</p>
          <h2 className="mt-3 font-heading text-[1.9rem] leading-tight tracking-tight text-foreground sm:text-[2.3rem]">
            Old age homes on CareConnect
          </h2>
        </div>
        <Button asChild variant="ghost" className="self-start rounded-full text-primary sm:self-auto">
          <Link to="/explore-homes">
            View all homes
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <ApiSection
          resource={resource}
          endpoints={["GET /public/organizations/featured"]}
          noticeTitle="Featured homes load from your API"
          noticeDescription="Once the CareConnect API is connected, the verified homes you feature will be listed here automatically."
        >
          {() =>
            homes.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No verified homes yet"
                description="Organisations appear here as soon as an administrator approves them."
                action={
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/register">Register an organisation</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {homes.map((home) => (
                  <OrganizationCard key={home.id || home._id} organization={home} onView={setSelected} />
                ))}
              </div>
            )
          }
        </ApiSection>
      </div>

      <OrganizationDialog organization={selected} open={Boolean(selected)} onOpenChange={(next) => !next && setSelected(null)} />
    </section>
  );
}