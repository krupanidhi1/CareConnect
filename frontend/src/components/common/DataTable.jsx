import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTable({ columns, rows, loading, empty }) {
  if (loading) {
    return (
      <div className="surface overflow-hidden p-5">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) return empty;

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, index) => (
              <tr key={row.id || index} className="transition-colors hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className={`px-5 py-3.5 ${column.className || ""}`}>
                    {column.render ? column.render(row) : row[column.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}