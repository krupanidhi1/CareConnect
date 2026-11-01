import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({ error, onRetry, title = "We couldn't load this" }) {
  const status = error?.status;
  return (
    <div className="surface p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {error?.message || "The request did not complete."}
            {status ? ` (HTTP ${status})` : ""}
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              <RotateCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}