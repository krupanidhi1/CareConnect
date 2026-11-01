import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
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
import { LayoutDashboard, LogOut, Menu, UserRound, HeartHandshake } from "lucide-react";
import Logo from "@/components/site/Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/explore-homes", label: "Old age homes" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/70 bg-background/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {(user?.full_name || user?.email || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="max-w-[9rem] truncate">{user?.full_name || "My account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <UserRound className="mr-2 h-4 w-4" /> Profile & settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout(true)} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/register">
                  <HeartHandshake className="mr-2 h-4 w-4" aria-hidden="true" />
                  Donate now
                </Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-6 flex flex-col gap-1">
              <Logo className="mb-6" />
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-[15px] font-medium transition-colors ${
                      isActive ? "bg-secondary text-primary" : "text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-5">
                {isAuthenticated ? (
                  <>
                    <Button asChild className="h-11">
                      <Link to="/dashboard">Go to dashboard</Link>
                    </Button>
                    <Button variant="outline" className="h-11" onClick={() => logout(true)}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="h-11">
                      <Link to="/register">Donate now</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-11">
                      <Link to="/login">Log in</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}