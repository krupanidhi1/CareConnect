import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/site/Logo";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A transparent bridge between people who want to give, the old age homes that need
            support, and volunteers who give their time.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link className="transition hover:text-primary" to="/explore-homes">Old age homes</Link></li>
            <li><Link className="transition hover:text-primary" to="/register">Become a volunteer</Link></li>
            <li><Link className="transition hover:text-primary" to="/register">Register an organisation</Link></li>
            <li><Link className="transition hover:text-primary" to="/dashboard">Your dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link className="transition hover:text-primary" to="/about">About us</Link></li>
            <li><Link className="transition hover:text-primary" to="/contact">Contact</Link></li>
            <li><Link className="transition hover:text-primary" to="/about#privacy">Privacy policy</Link></li>
            <li><Link className="transition hover:text-primary" to="/about#terms">Terms of use</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">Get in touch</h3>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Have a question about an organisation, contribution or volunteer opportunity?
          </p>
          <Link className="mt-3 inline-flex text-sm font-semibold text-primary transition hover:text-accent" to="/contact">
            Use the contact form
          </Link>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {YEAR} CareConnect. Built for dignity, transparency and care.</p>
          <p>CareConnect · A project built around dignity, transparency and care.</p>
        </div>
      </div>
    </footer>
  );
}