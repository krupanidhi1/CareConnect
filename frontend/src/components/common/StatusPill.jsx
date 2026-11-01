import React from "react";

const TONES = {
  pending: "bg-[hsl(38_88%_94%)] text-[hsl(30_62%_34%)]",
  awaiting: "bg-[hsl(38_88%_94%)] text-[hsl(30_62%_34%)]",
  accepted: "bg-[hsl(205_70%_93%)] text-[hsl(210_58%_34%)]",
  confirmed: "bg-[hsl(205_70%_93%)] text-[hsl(210_58%_34%)]",
  in_progress: "bg-[hsl(248_52%_94%)] text-[hsl(250_44%_40%)]",
  in_transit: "bg-[hsl(248_52%_94%)] text-[hsl(250_44%_40%)]",
  open: "bg-accent/12 text-accent",
  partial: "bg-[hsl(205_70%_93%)] text-[hsl(210_58%_34%)]",
  closed: "bg-muted text-muted-foreground",
  delivered: "bg-accent/12 text-accent",
  fulfilled: "bg-accent/12 text-accent",
  completed: "bg-accent/12 text-accent",
  verified: "bg-accent/12 text-accent",
  active: "bg-accent/12 text-accent",
  approved: "bg-accent/12 text-accent",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  unverified: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
};

const LABELS = {
  pending: "Pending",
  awaiting: "Awaiting review",
  accepted: "Accepted",
  confirmed: "Confirmed",
  in_progress: "In progress",
  in_transit: "In transit",
  open: "Open",
  partial: "Partially fulfilled",
  closed: "Closed",
  delivered: "Delivered",
  fulfilled: "Fulfilled",
  completed: "Completed",
  verified: "Verified",
  active: "Active",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  unverified: "Unverified",
  suspended: "Suspended",
};

export default function StatusPill({ status }) {
  const key = String(status || "").toLowerCase().replace(/\s+/g, "_");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        TONES[key] || "bg-muted text-muted-foreground"
      }`}
    >
      {LABELS[key] || status || "Unknown"}
    </span>
  );
}