import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, ArrowRight } from "lucide-react";
import useApiResource from "@/hooks/useApiResource";
import { publicApi } from "@/api/careconnect";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import RequirementCard from "@/components/site/RequirementCard";
import { Button } from "@/components/ui/button";

export default function UrgentNeeds() {
  const resource = useApiResource(() => publicApi.urgentRequirements({ limit: 3 }));
  const [pending, setPending] = useState(null);
  const needs = Array.isArray(resource.data) ? resource.data : resource.data?.items || [];

  return (
    <section className="shell mt-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">Urgent requirements</p>
          <h2 className="mt-3 font-heading text-[1.9rem] leading-tight tracking-tight text-foreground sm:text-[2.3rem]">
            What homes need right now
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Highest-priority requirements, published by the homes themselves.
          </p>
        </div>
        <Button asChild variant="ghost" className="self-start rounded-full text-primary sm:self-auto">
          <Link to="/explore-homes">
            Browse all needs
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <ApiSection
          resource={resource}
          endpoints={["GET /public/requirements/urgent"]}
          noticeTitle="Urgent needs load from your API"
          noticeDescription="Requirement cards with live progress bars appear here as soon as the API responds."
        >
          {() =>
            needs.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No open requirements"
                description="When a home publishes a need, it will appear here with its progress."
                action={
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/explore-homes">Explore old age homes</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {needs.map((need) => (
                  <RequirementCard
                    key={need.id || need._id}
                    requirement={need}
                    onDonate={(requirement) => setPending(requirement)}
                  />
                ))}
              </div>
            )
          }
        </ApiSection>
      </div>

      {pending && (
        <p className="mt-4 rounded-2xl border border-border/70 bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
          Sign in as a donor to contribute to “{pending.title}”. Contributions are recorded by the
          CareConnect API and confirmed only when it responds.
        </p>
      )}
    </section>
  );
}