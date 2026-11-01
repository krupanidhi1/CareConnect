import React from "react";
import { Link } from "react-router-dom";
import { HeartHandshake } from "lucide-react";

export default function Logo({ tone = "dark", className = "" }) {
  const text = tone === "light" ? "text-primary-foreground" : "text-foreground";
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="CareConnect home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <HeartHandshake className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      </span>
      <span className={`font-heading text-[1.15rem] tracking-tight ${text}`}>
        Care<span className="text-accent">Connect</span>
      </span>
    </Link>
  );
}