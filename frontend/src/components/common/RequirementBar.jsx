import React from "react";

export default function RequirementBar({ received = 0, required = 0, compact }) {
  const total = Number(required) || 0;
  const got = Number(received) || 0;
  const percent = total > 0 ? Math.min(100, Math.round((got / total) * 100)) : 0;

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-foreground">
          {got.toLocaleString()} <span className="font-normal text-muted-foreground">of {total.toLocaleString()}</span>
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}