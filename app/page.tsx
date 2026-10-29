 import React from "react";
import ScrollProvider from "@/components/homepage/ScrollProvider"; // 1. I-import ang ScrollProvider
import HeroSection from "@/components/homepage/HeroSection";
import ContentSection from "@/components/homepage/ContentSection";
import FlowPath from "@/components/homepage/FlowPath";
import ScaleFrame from "@/components/homepage/ScaleFrame";
import MoreSections from "@/components/homepage/MoreSections";

export default function Home() {
  return (
    <ScrollProvider> 
      <ScaleFrame>
        
        <ContentSection />
        <FlowPath />
        <HeroSection />
      </ScaleFrame>

      
      <MoreSections />
    </ScrollProvider>
  );
}
