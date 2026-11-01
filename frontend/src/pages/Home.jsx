import React from "react";
import Hero from "@/components/home/Hero";
import ImpactStrip from "@/components/home/ImpactStrip";
import FeaturedHomes from "@/components/home/FeaturedHomes";
import UrgentNeeds from "@/components/home/UrgentNeeds";
import HowItWorks from "@/components/home/HowItWorks";
import MissionBand from "@/components/home/MissionBand";
import CtaBand from "@/components/home/CtaBand";

export default function Home() {
  return (
    <>
      <title>CareConnect — Together, We Make Every Life Matter</title>
      <Hero />
      <ImpactStrip />
      <FeaturedHomes />
      <UrgentNeeds />
      <HowItWorks />
      <MissionBand />
      <CtaBand />
    </>
  );
}