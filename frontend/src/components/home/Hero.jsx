import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { HeartHandshake, HandHeart, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="shell relative grid items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Support needs from reviewed organisations
          </span>

          <h1 className="mt-6 font-heading text-[2.6rem] leading-[1.06] tracking-[-0.02em] text-foreground sm:text-[3.4rem] lg:text-[3.9rem]">
            Together, we make
            <span className="block text-primary">
              every life <em className="not-italic text-accent">matter.</em>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            CareConnect links donors, old age homes and volunteers on one transparent platform.
            Homes publish the exact support they need — rice, blankets, medicines or time — and
            you can follow each contribution through the status the home records.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6 text-[15px]">
              <Link to="/register">
                <HeartHandshake className="mr-2 h-4 w-4" aria-hidden="true" />
                Donate now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-[15px]">
              <Link to="/register">Become a volunteer</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-4 text-[15px] text-primary">
              <Link to="/explore-homes">
                Explore old age homes
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-1 gap-4 border-t border-border/70 pt-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Verified organisations" },
              { icon: HandHeart, label: "Needs matched to your gift" },
              { icon: CheckCircle2, label: "Every status tracked" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <dt className="text-xs font-medium leading-snug text-muted-foreground">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-secondary shadow-[0_40px_80px_-50px_rgba(16,54,44,0.6)]">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Old_age_home_with_sarothi_volunteers.jpg/1280px-Old_age_home_with_sarothi_volunteers.jpg"
              alt="Volunteers from Swopno Sarothi taking part in activities with older residents"
              className="aspect-[5/4] w-full"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-lg backdrop-blur sm:-bottom-8 sm:left-6 sm:right-auto sm:w-[19rem]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Published by verified homes</p>
                <p className="text-xs text-muted-foreground">Published by registered homes only.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}