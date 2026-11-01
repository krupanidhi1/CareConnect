import React from "react";
import { Building2, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

export default function OrganizationCard({ organization, onView }) {
  const name = organization?.name || organization?.organizationName || "Old age home";
  const verification = organization?.verificationStatus || organization?.status;
  const verified = organization?.verified || ["verified", "approved"].includes(String(verification).toLowerCase());
  const location = [organization?.city, organization?.state].filter(Boolean).join(", ") || organization?.location;

  return (
    <article className="group surface flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(16,54,44,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {organization?.imageUrl || organization?.photoUrl || organization?.coverImage ? (
          <Image
            src={organization.imageUrl || organization.photoUrl || organization.coverImage}
            alt={name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Building2 className="h-10 w-10 text-primary/25" aria-hidden="true" />
          </div>
        )}
        {verified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold text-accent shadow-sm backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg leading-snug text-foreground">{name}</h3>
        {location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {location}
          </p>
        )}
        {organization?.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {organization.description}
          </p>
        )}
        <div className="mt-auto pt-5">
          <Button variant="outline" size="sm" className="w-full rounded-full" onClick={() => onView?.(organization)}>
            View details
            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}