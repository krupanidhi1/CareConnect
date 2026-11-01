import React, { useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { resolveRole, ROLE_LABEL, displayName } from "@/lib/roles";
import Logo from "@/components/site/Logo";
import NotificationsMenu from "@/components/dashboard/NotificationsMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  UserRound,
  Building2,
  LifeBuoy,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/profile", label: "Profile & settings", icon: UserRound },
  { to: "/explore-homes", label: "Old age homes", icon: Building2 },
  { to: "/contact", label: "Support", icon: LifeBuoy },
];

function SidebarContent({ role, user, logout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6">
        <Logo />
      </div>

      <div className="mx-4 mt-6 rounded-2xl border border-border/70 bg-card p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Signed in as</p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{displayName(user)}</p>
        <span className="mt-2 inline-flex rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
          {ROLE_LABEL[role] || "Member"}
        </span>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3" aria-label="Dashboard">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`
            }
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border/70 p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View public site
        </Link>
        <button
          type="button"
          onClick={() => logout(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/8"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const role = resolveRole(user);

  if (user && !role) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[268px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-sidebar lg:block">
        <SidebarContent role={role} user={user} logout={logout} />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open dashboard menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[84vw] max-w-xs bg-sidebar p-0">
                <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                <SidebarContent role={role} user={user} logout={logout} />
              </SheetContent>
            </Sheet>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="font-medium text-foreground">CareConnect</span>
              <span aria-hidden="true">/</span>
              <span className="capitalize">{location.pathname.includes("profile") ? "Profile" : "Dashboard"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationsMenu />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
                    {displayName(user).slice(0, 1).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="cursor-pointer">
                    <UserRound className="mr-2 h-4 w-4" /> Profile & settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => logout(true)}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}