import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/site/Logo";
import { HeartHandshake, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_1fr]">
      <div className="relative hidden overflow-hidden bg-primary px-12 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary-foreground/60">
            CareConnect
          </p>
          <h2 className="mt-4 font-heading text-[2.4rem] leading-[1.1] tracking-tight">
            Every contribution, with a clear record of its next steps.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-primary-foreground/80">
            {[
              { icon: ShieldCheck, text: "Organisations are reviewed before they can receive support." },
              { icon: HeartHandshake, text: "Requirements itemised, so one gift can finish a real need." },
              { icon: CheckCircle2, text: "Donation, requirement and volunteer status always visible." },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary-foreground/10">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          Together, we make every life matter.
        </p>
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-background px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
            <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-primary">
              Back to site
            </Link>
          </div>

          <div className="mb-7">
            <div className="inline-flex items-center justify-center rounded-2xl bg-secondary p-3 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-heading text-[2rem] leading-tight tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="surface p-6 sm:p-7">{children}</div>

          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}