 "use client";

import React from "react";
import dynamic from "next/dynamic";

// Ligtas na ipinasok ang tamang spelling ng file name mula sa sidebar (GhostFibres)
const GhostFibers = dynamic(() => import("../GhostFibers"), { ssr: false });

export default function ClientBackground() {
  return (
    // Ginawang malinis na absolute layer na sumasabay sa kabuuang taas at lapad ng lalagyan nito
    <div className="absolute inset-0 h-full w-full z-0 pointer-events-none opacity-50">
      <GhostFibers 
        glowColor="#067656" // Brand color ng Manipu
        lineColor="#ffffff" // Puting sinulid na lulutang sa madilim na section
      />
    </div>
  );
}
