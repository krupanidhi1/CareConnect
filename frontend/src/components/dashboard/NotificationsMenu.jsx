import React from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useApiResource from "@/hooks/useApiResource";
import { isApiConfigured, notificationsApi } from "@/api/careconnect";

export default function NotificationsMenu() {
  const resource = useApiResource(() => notificationsApi.list());
  const items = Array.isArray(resource.data) ? resource.data : resource.data?.items || [];
  const unread = items.filter((item) => !(item.read || item.isRead)).length;

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      resource.refresh();
    } catch {
      resource.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[22rem] overflow-y-auto">
          {!isApiConfigured() ? (
            <p className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
              Notifications come from the CareConnect API.
              <br />
              <span className="font-mono text-[10px]">GET /notifications</span>
            </p>
          ) : resource.loading ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">Loading…</p>
          ) : resource.error ? (
            <p className="px-4 py-6 text-center text-xs text-destructive">{resource.error.message}</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <Inbox className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Nothing yet. Updates will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {items.slice(0, 8).map((item) => (
                <li
                  key={item.id || item._id}
                  className={`px-4 py-3 ${!(item.read || item.isRead) ? "bg-accent/[0.04]" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        !(item.read || item.isRead) ? "bg-accent" : "bg-border"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-foreground">{item.title || "Update"}</p>
                      {item.message && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.message}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}