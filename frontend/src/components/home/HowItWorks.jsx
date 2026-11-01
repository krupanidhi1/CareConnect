import React from "react";
import { Search, HandHeart, PackageCheck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find a verified need",
    body: "Browse registered old age homes and the exact requirements they have published — quantities, urgency and progress included.",
  },
  {
    icon: HandHeart,
    title: "Choose how you help",
    body: "Contribute goods, record an amount pledge, or offer your time as a volunteer. You decide how you would like to help.",
  },
  {
    icon: PackageCheck,
    title: "Follow it to delivery",
    body: "The home accepts, receives and closes each contribution, so you can see the outcome instead of guessing.",
  },
];

export default function HowItWorks() {
  return (
    <section className="shell mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How CareConnect works</p>
        <h2 className="mt-3 font-heading text-[2rem] leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
          Three steps from intention to impact
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          No vague appeals. Public listings belong to organisations that have passed platform review, and
          each recorded contribution carries a status you can follow.
        </p>
      </div>

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="surface relative p-6">
            <span className="absolute right-5 top-5 font-heading text-4xl leading-none text-secondary">
              0{index + 1}
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <step.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-heading text-lg text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}