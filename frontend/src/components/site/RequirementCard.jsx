import React from "react";
import { CalendarClock, Package } from "lucide-react";
import RequirementBar from "@/components/common/RequirementBar";
import StatusPill from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";

const PRIORITY_TONE = {
  urgent: "text-destructive",
  high: "text-[hsl(28_70%_42%)]",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
};

export default function RequirementCard({ requirement, onDonate }) {
  const title = requirement?.title || "Requirement";
  const unit = requirement?.unit ? ` ${requirement.unit}` : "";
  const deadline = requirement?.deadline || requirement?.requiredBy;

  return (
    <article className="surface flex h-full flex-col p-5 transition-shadow duration-300 hover:shadow-[0_24px_50px_-38px_rgba(16,54,44,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
          <Package className="h-3 w-3" aria-hidden="true" />
          {requirement?.category || "General"}
        </span>
        <StatusPill status={requirement?.priority || requirement?.status} />
      </div>

      <h3 className="mt-3 font-heading text-lg leading-snug text-foreground">{title}</h3>
      {requirement?.organizationName && (
        <p className="mt-1 text-xs text-muted-foreground">{requirement.organizationName}</p>
      )}

      <div className="mt-4">
        <RequirementBar received={requirement?.receivedQuantity} required={requirement?.requiredQuantity} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className={PRIORITY_TONE[String(requirement?.priority).toLowerCase()] || ""}>
          {requirement?.requiredQuantity ? `${requirement.requiredQuantity}${unit} needed` : "Quantity on request"}
        </span>
        {deadline && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {new Date(deadline).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      <Button size="sm" className="mt-5 w-full rounded-full" onClick={() => onDonate?.(requirement)}>
        Contribute
      </Button>
    </article>
  );
}