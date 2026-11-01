import React from "react";
import { PlugZap, ArrowUpRight } from "lucide-react";
import { API_BASE_URL } from "@/api/careconnect";

/**
 * Honest placeholder: shown wherever a panel needs live CareConnect API data.
 * No sample records are ever rendered in its place.
 */
export default function BackendNotice({
  title = "Waiting for the CareConnect API",
  description = "This panel is wired to your Express backend. It fills with real records as soon as the API responds.",
  endpoints = [],
  compact = false,
}) {
  return (
    <div className={`surface ${compact ? "p-5" : "p-6 sm:p-8"}`}>
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
          <PlugZap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>

          {endpoints.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {endpoints.map((endpoint) => (
                <li
                  key={endpoint}
                  className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                >
                  {endpoint}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Nothing here is simulated.</span>
            <span>
              {API_BASE_URL ? (
                <>API base: <span className="font-mono">{API_BASE_URL}</span></>
              ) : (
                <>Set <span className="font-mono">VITE_CARECONNECT_API_URL</span> to your deployed API to switch it on.</>
              )}
            </span>
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
          <ArrowUpRight className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>Confirm these routes against your Express router, then set the base URL.</span>
        </div>
      )}
    </div>
  );
}