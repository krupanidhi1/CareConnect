import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import ImpactStrip from "@/components/home/ImpactStrip";
import HowItWorks from "@/components/home/HowItWorks";
import { Compass, Target, ShieldCheck, Users } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    title: "Our mission",
    body: "Make support needs at old-age homes easier to discover. CareConnect gives registered homes a place to publish what they need and gives donors and volunteers a clear way to respond.",
  },
  {
    icon: Compass,
    title: "Our vision",
    body: "A giving ecosystem where organisations are reviewed, contributions have clear status updates and volunteers can find meaningful ways to help.",
  },
];

export default function About() {
  return (
    <>
      <title>About CareConnect — transparency in elder care</title>

      <section className="shell pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <p className="eyebrow">About CareConnect</p>
          <h1 className="mt-4 font-heading text-[2.4rem] leading-[1.08] tracking-[-0.02em] text-foreground sm:text-[3.2rem]">
            Care that begins with an honest record
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            CareConnect is a donation and support management platform for old age homes. Homes
            publish their requirements, donors contribute against them, volunteers offer their time,
            and administrators verify that every organisation on the platform is real.
          </p>
        </div>
      </section>

      <section className="shell mt-12">
        <div className="grid gap-5 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="surface p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
                <pillar.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-heading text-xl text-foreground">{pillar.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell mt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-border/70">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Shibasram_Old_Age_Home.jpg/1280px-Shibasram_Old_Age_Home.jpg"
              alt="Shibasram Old Age Home in Kolkata"
              className="aspect-[4/3] w-full"
            />
          </div>
          <div>
            <p className="eyebrow">Social impact</p>
            <h2 className="mt-3 font-heading text-[1.9rem] leading-tight tracking-tight text-foreground sm:text-[2.2rem]">
              Small contributions, properly coordinated
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Most homes do not need a campaign; they need twenty blankets before winter, a monthly
              supply of medicines, or someone to sit with residents on Sunday afternoons. Because
              requirements are itemised, a single person can finish a real need instead of adding to
              an anonymous pool.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: "Verified homes", body: "Administrators review every organisation before it can receive support." },
                { icon: Users, title: "Volunteers matched", body: "Opportunities are published with schedules and locations, so time is used well." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/70 bg-card p-4">
                  <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <ImpactStrip />

      <section className="shell mt-24">
        <div className="surface p-7 sm:p-9">
          <h2 className="font-heading text-xl text-foreground">How the platform works</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">For donors</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Browse verified homes, pick a requirement, choose how much to contribute and follow
                the status until the home marks it fulfilled.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">For old age homes</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Register your organisation, submit details for verification, publish requirements and
                manage incoming donations from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">For volunteers</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Find opportunities near you, apply with a short message, and track whether your
                application was accepted.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">For administrators</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Review verification requests, monitor donation lifecycles and keep the network
                accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="privacy" className="shell mt-16 scroll-mt-24">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="surface p-7">
            <h2 className="font-heading text-lg text-foreground">Privacy policy</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              We collect only the details needed to operate your account and complete contributions.
              Your contact information is shared with a home only when you donate or apply to
              volunteer with them. One-time codes are never stored in the browser and passwords are
              never stored in plain text.
            </p>
          </div>
          <div id="terms" className="surface scroll-mt-24 p-7">
            <h2 className="font-heading text-lg text-foreground">Terms of use</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Organisations must provide accurate registration details and may only publish
              requirements they genuinely need. Donations recorded on CareConnect are fulfilled
              directly between donor and home; the platform records and tracks the commitment rather
              than processing the gift itself.
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button asChild className="rounded-full">
            <Link to="/register">Join CareConnect</Link>
          </Button>
        </div>
      </section>
    </>
  );
}