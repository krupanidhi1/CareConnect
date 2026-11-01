import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import useApiResource from "@/hooks/useApiResource";
import { requirementsApi } from "@/api/careconnect";
import ApiSection from "@/components/common/ApiSection";
import RequirementBar from "@/components/common/RequirementBar";
import StatusPill from "@/components/common/StatusPill";

export default function OrganizationDialog({ organization, open, onOpenChange }) {
  const orgId = organization?.id || organization?._id;
  const requirements = useApiResource(
    () => requirementsApi.list({ organizationId: orgId, limit: 6 }),
    [orgId]
  );

  if (!organization) return null;

  const name = organization.name || organization.organizationName || "Old age home";
  const location = [organization.city, organization.state].filter(Boolean).join(", ") || organization.location;
  const items = Array.isArray(requirements.data)
    ? requirements.data
    : requirements.data?.items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        <div className="relative aspect-[16/8] w-full overflow-hidden bg-secondary">
          {organization.imageUrl || organization.photoUrl || organization.coverImage ? (
            <Image
              src={organization.imageUrl || organization.photoUrl || organization.coverImage}
              alt={name}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Building2 className="h-12 w-12 text-primary/25" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-7">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-2xl">{name}</DialogTitle>
            {location && (
              <DialogDescription className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {location}
              </DialogDescription>
            )}
          </DialogHeader>

          {organization.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{organization.description}</p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Verification</p>
              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                <StatusPill status={organization.verificationStatus || (organization.verified ? "verified" : "unverified")} />
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
              <p className="mt-2 truncate text-sm text-foreground">{organization.email || organization.contactEmail || "—"}</p>
              <p className="text-xs text-muted-foreground">{organization.phone || organization.contactPhone || ""}</p>
            </div>
          </div>

          <h3 className="mt-7 font-heading text-lg text-foreground">Current requirements</h3>
          <div className="mt-3">
            <ApiSection
              resource={requirements}
              endpoints={[`GET /public/requirements?organization_id=${orgId}`]}
              noticeTitle="Requirements load from your API"
              noticeDescription="Open needs for this home appear here with live progress."
              skeletonRows={2}
            >
              {() =>
                items.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
                    No open requirements right now.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.id || item._id} className="rounded-2xl border border-border/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <StatusPill status={item.priority} />
                        </div>
                        <div className="mt-3">
                          <RequirementBar received={item.receivedQuantity} required={item.requiredQuantity} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              }
            </ApiSection>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-6 py-4">
          <Button asChild className="rounded-full">
            <Link to="/register">Support this home</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}