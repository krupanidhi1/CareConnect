import React, { useEffect, useState } from "react";
import { Search, MapPin, Building2, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useApiResource from "@/hooks/useApiResource";
import { organizationsApi } from "@/api/careconnect";
import ApiSection from "@/components/common/ApiSection";
import EmptyState from "@/components/common/EmptyState";
import OrganizationCard from "@/components/site/OrganizationCard";
import OrganizationDialog from "@/components/site/OrganizationDialog";

const PAGE_SIZE = 9;

export default function ExploreHomes() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resource = useApiResource(
    () =>
      organizationsApi.list({
        search: search || undefined,
        location: location || undefined,
        verified: verifiedOnly || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    [search, location, verifiedOnly, page]
  );

  const payload = resource.data;
  const homes = Array.isArray(payload) ? payload : payload?.items || [];
  const total = payload?.pagination?.total ?? payload?.total;
  const hasMore = payload?.pagination?.hasMore ?? (typeof total === "number" ? page * PAGE_SIZE < total : false);

  return (
    <>
      <title>Explore old age homes — CareConnect</title>

      <section className="shell pt-14 sm:pt-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Explore</p>
          <h1 className="mt-4 font-heading text-[2.3rem] leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[3rem]">
            Old age homes that need your help
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Every home listed here is registered on CareConnect. Open a profile to see its current
            requirements and how far each one has progressed.
          </p>
        </div>

        <div className="surface mt-9 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or description"
              aria-label="Search old age homes"
              className="h-11 pl-10"
            />
          </div>
          <div className="relative sm:w-56">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setPage(1);
              }}
              placeholder="City or state"
              aria-label="Filter by location"
              className="h-11 pl-10"
            />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 px-3 py-2.5">
            <Switch
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={(next) => {
                setVerifiedOnly(next);
                setPage(1);
              }}
            />
            <Label htmlFor="verified-only" className="cursor-pointer text-sm font-medium">
              Verified only
            </Label>
          </div>
        </div>

        <div className="mt-8">
          <ApiSection
            resource={resource}
            endpoints={["GET /public/organizations?search&location&verified&page&limit"]}
            noticeTitle="Organisation directory loads from your API"
            noticeDescription="Search, filters and pagination are already wired to the organisations endpoint — cards appear as soon as the API responds."
          >
            {() =>
              homes.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No homes match your filters"
                  description="Try a different city, clear the verified-only filter, or search for another name."
                  action={
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSearchInput("");
                        setLocation("");
                        setVerifiedOnly(false);
                        setPage(1);
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {homes.map((home) => (
                      <OrganizationCard key={home.id || home._id} organization={home} onView={setSelected} />
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                      Page {page}
                      {typeof total === "number" ? ` of ${Math.max(1, Math.ceil(total / PAGE_SIZE))}` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={!hasMore}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </>
              )
            }
          </ApiSection>
        </div>
      </section>

      <OrganizationDialog organization={selected} open={Boolean(selected)} onOpenChange={(next) => !next && setSelected(null)} />
    </>
  );
}