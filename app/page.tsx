 import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import ContentSection from "@/components/homepage/ContentSection";
import FlowPath from "@/components/homepage/FlowPath";
import ScaleFrame from "@/components/homepage/ScaleFrame";
import MoreSections from "@/components/homepage/MoreSections";

export default function Home() {
  return (
    <>
      <ScaleFrame>
        {/* Pagkakasunod: glow/content -> curve + pills -> hero text */}
        <ContentSection />
        <FlowPath />
        <HeroSection />
      </ScaleFrame>

      {/* Mga bagong section sa ilalim ng hero */}
      <MoreSections />
    </>
  );
}