import React from "react";

/**
 * Curve + 4 gumagalaw na pills (Tindahan, Shop, Store, Market).
 * - float: dahan-dahang pataas-baba
 * - flip: umiikot sa Y axis at lumalabas ang Filipino na kapares na salita
 * Palitan lang ang `back` kung iba ang gusto mong lumabas sa likod.
 */

const PATH =
  "M 858 231 C 990 235, 1060 330, 1118 483 C 1135 600, 1060 720, 955 752 C 850 790, 720 770, 585 708";

type Pill = {
  front: string;
  back: string;
  x: number;
  y: number;
  tone: "light" | "green";
  delay: number; // seconds (negative = nagsimula na)
};

const PILLS: Pill[] = [
  { front: "Tindahan", back: "Sari-sari", x: 858, y: 231, tone: "light", delay: 0 },
  { front: "Shop", back: "Mamili", x: 1118, y: 483, tone: "light", delay: -2 },
  { front: "Store", back: "Benta", x: 955, y: 752, tone: "green", delay: -4 },
  { front: "Market", back: "Palengke", x: 585, y: 708, tone: "green", delay: -6 },
];

const FRONT = {
  light: "bg-white/[0.16] text-white",
  green: "bg-[#067656]/[0.45] text-[#020202]",
};
const BACK = {
  light: "bg-white/[0.30] text-white",
  green: "bg-[#067656]/[0.80] text-white",
};

const faceBase =
  "absolute inset-0 flex items-center justify-center gap-[8px] rounded-full font-outfit text-[20px]";
const hidden: React.CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

function Pin({ color }: { color: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden>
      <path
        d="M8 18s5-4.6 5-9A5 5 0 0 0 3 9c0 4.4 5 9 5 9z"
        stroke={color}
        strokeWidth="1.4"
      />
      <circle cx="8" cy="9" r="1.8" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

export default function FlowPath() {
  return (
    <>
      <style>{`
        @keyframes mp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes mp-flip {
          0%, 35%  { transform: rotateY(0deg); }
          50%, 85% { transform: rotateY(180deg); }
          100%     { transform: rotateY(360deg); }
        }
        .mp-float { animation: mp-float 5s ease-in-out infinite; }
        .mp-flip  { animation: mp-flip 8s ease-in-out infinite; transform-style: preserve-3d; }
        @media (prefers-reduced-motion: reduce) {
          .mp-float, .mp-flip { animation: none; }
        }
      `}</style>

      {/* Curve */}
      <svg
        width="1440"
        height="1024"
        viewBox="0 0 1440 1024"
        fill="none"
        className="absolute left-0 top-0 pointer-events-none z-10"
        aria-hidden
      >
        <path d={PATH} stroke="#6C6767" strokeWidth="1" />
        {/* tuldok na bumabiyahe sa kurba */}
        <circle r="5" fill="#0D0B0B">
          <animateMotion dur="14s" repeatCount="indefinite" path={PATH} />
        </circle>
      </svg>

      {/* Pills */}
      {PILLS.map((p, i) => (
        <div
          key={p.front}
          className="absolute z-20"
          style={{ left: p.x, top: p.y }}
        >
          <div className="-translate-x-1/2 -translate-y-1/2">
            <div
              className="mp-float"
              style={{ animationDelay: `${i * -1.2}s` }}
            >
              <div style={{ perspective: 600 }}>
                <div
                  className="mp-flip relative w-[136px] h-[40px]"
                  style={{ animationDelay: `${p.delay}s` }}
                >
                  {/* Harap */}
                  <div className={`${faceBase} ${FRONT[p.tone]}`} style={hidden}>
                    <Pin color={p.tone === "light" ? "#fff" : "#020202"} />
                    <span>{p.front}</span>
                  </div>
                  {/* Likod */}
                  <div
                    className={`${faceBase} ${BACK[p.tone]}`}
                    style={{ ...hidden, transform: "rotateY(180deg)" }}
                  >
                    <Pin color="#fff" />
                    <span>{p.back}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}