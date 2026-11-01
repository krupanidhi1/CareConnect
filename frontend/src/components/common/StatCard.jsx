import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({ icon: Icon, label, value, hint, loading, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/8 text-primary",
    accent: "bg-accent/10 text-accent",
    warm: "bg-[hsl(38_60%_52%)]/12 text-[hsl(32_54%_38%)]",
    quiet: "bg-muted text-muted-foreground",
  };

  return (
    <div className="surface p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone] || tones.primary}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-8 w-24" />
      ) : (
        <p className="mt-3 font-heading text-[1.9rem] leading-none tracking-tight text-foreground">
          {value ?? "—"}
        </p>
      )}
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}