import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeartHandshake } from "lucide-react";

export default function CtaBand() {
  return (
    <section className="shell mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-7 py-12 text-primary-foreground sm:px-12 sm:py-14">
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent-foreground/70">
              Start where you are
            </p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-tight tracking-tight sm:text-[2.4rem]">
              A bag of rice, a free afternoon, a blanket — it all counts.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
              Create an account as a donor, an old age home or a volunteer. You will only ever see
              the tools that belong to your role.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-full bg-primary-foreground px-6 text-primary hover:bg-primary-foreground/90">
              <Link to="/register">
                <HeartHandshake className="mr-2 h-4 w-4" aria-hidden="true" />
                Create your account
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/explore-homes">See who needs help</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}