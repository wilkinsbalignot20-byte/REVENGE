 "use client";

import React, { useEffect, useState } from "react";

const DESIGN_W = 1440;
const DESIGN_H = 1024;
const GREEN_H = 512; // taas na berdeng kalahati

/* Hero lang ito. Sinusukat sa lapad ng screen, kaya puwede nang mag-scroll pababa. */
export default function ScaleFrame({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setS(window.innerWidth / DESIGN_W);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = s ?? 1;

  return (
    <header
      className="relative w-full overflow-hidden bg-[#EEF2F0]"
      style={{ height: DESIGN_H * scale, visibility: s ? "visible" : "hidden" }}
    >
      <div
        className="absolute left-0 top-0 w-full bg-[#067656] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)]"
        style={{ height: GREEN_H * scale }}
      />
      <div
        className="absolute left-0 top-0"
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </header>
  );
}