import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Check } from "lucide-react";

const POINTS = [
  "Requirements are published by the homes themselves, never written for them.",
  "Contributions move through a clear lifecycle: pending, confirmed, in transit and delivered.",
  "Only verified organisations can receive support through the platform.",
];

export default function MissionBand() {
  return (
    <section className="shell mt-24">
      <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] border border-border/70 bg-card lg:grid-cols-2">
        <div className="order-2 p-7 sm:p-10 lg:order-1 lg:p-12">
          <p className="eyebrow">Why transparency matters</p>
          <h2 className="mt-3 font-heading text-[1.9rem] leading-tight tracking-tight text-foreground sm:text-[2.3rem]">
            Dignity is built on trust you can check
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            CareConnect is designed to make needs easier to find and contributions easier to follow.
            Homes can publish specific requirements, while donors and volunteers can see the status
            of the support they have offered.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-7 rounded-full">
            <Link to="/about">Read our story</Link>
          </Button>
        </div>
        <div className="order-1 h-full lg:order-2">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Helping_elderly_community.jpg/1280px-Helping_elderly_community.jpg"
            alt="Older adults being accompanied on a community temple visit in Bengaluru"
            className="h-full min-h-[18rem] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}