import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton({ rows = 3, className = "" }) {
  return (
    <div className={`surface divide-y divide-border/70 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}