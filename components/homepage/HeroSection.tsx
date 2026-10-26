 "use client";

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Image from "next/image";

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

// Count-up na numero para sa stats (0 -> target)
function useCountUp(target: number, duration = 1400, delay = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const p = Math.min(Math.max((now - t0) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

function StatRow({ label, value, w, i }: { label: string; value: number; w: number; i: number }) {
  const n = useCountUp(value, 1400, 600 + i * 150);
  return (
    <div className="hero-fade" style={{ animationDelay: `${0.45 + i * 0.12}s` }}>
      <div className="flex justify-between text-white uppercase mb-1 text-[11px] font-medium">
        <span>{label}</span>
        <span className="font-bold tabular-nums">{n}</span>
      </div>
      <div className="h-[2px] bg-white/20 w-full relative overflow-hidden">
        <div
          className="bar-fill h-full bg-white"
          style={{ width: `${w}%`, animationDelay: `${0.7 + i * 0.15}s` }}
        />
      </div>
    </div>
  );
}

const SKILLS = [
  // Apoy
  <svg key="fire" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-.5-2-1-3 3 1 5 4 5 7a7 7 0 0 1-14 0c0-5 4-7 7-13z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>,
  // Bungo
  <svg key="skull" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.3 3 5.4V20h10v-3.6c1.8-1.1 3-2.9 3-5.4a8 8 0 0 0-8-8z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1.7" fill="#fff" />
    <circle cx="15" cy="11.5" r="1.7" fill="#fff" />
    <path d="M10 20v-2M14 20v-2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
  // Korona / crest
  <svg key="crest" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 8l4.5 4L12 4l4.5 8L21 8l-2 11H5L3 8z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 16h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>,
];

export default function HeroSection() {
  // Mouse tilt — para na lang sa stats panel (steady na ang kuneho)
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const level = useCountUp(51, 1600, 400);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: px * 18, y: py * -12 });
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <section
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      className="relative min-h-[65vh] bg-[#067656] text-white pt-24 pb-10 overflow-hidden flex items-center"
    >
      <style>{`
        @keyframes ringSpin { to { transform: rotateX(72deg) rotateZ(360deg) } }
        @keyframes ringSpinRev { to { transform: rotateX(72deg) rotateZ(-360deg) } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
        @keyframes tagFloatA { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes tagFloatB { 0%,100% { transform: translateY(0) } 50% { transform: translateY(8px) } }
        @keyframes sparkle { 0%,100% { transform: scale(.6) rotate(0); opacity: .2 } 50% { transform: scale(1.2) rotate(90deg); opacity: 1 } }
        @keyframes barGrow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes glowPulse { 0%,100% { opacity: .15 } 50% { opacity: .35 } }
        @keyframes thumbSlide { 0%,100% { top: 0% } 50% { top: 62% } }
        @keyframes skillPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0) } 50% { box-shadow: 0 0 14px 0 rgba(255,255,255,.28) } }
        .hero-fade { animation: fadeUp .8s ease-out both }
        .bar-fill { transform-origin: left; animation: barGrow 1.4s cubic-bezier(.2,.8,.2,1) both }
        @media (prefers-reduced-motion: reduce) {
          .hero-anim, .hero-fade, .bar-fill { animation: none !important }
        }
      `}</style>

      <Navbar />

      {/* TEXT AT CONTENT LAYER */}
      <div className="relative mx-auto w-full max-w-[1200px] px-12 z-10">
        {/* KALIWANG BAHAGI: Teksto at Buttons */}
        <div className="w-full lg:w-[60%] flex flex-col items-start">
          {/* Badge */}
          <div
            className="hero-fade h-[32px] flex items-center gap-2 bg-white/10 border border-white/20 rounded-[30px] px-[12px]"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="hero-anim w-[6px] h-[6px] rounded-full bg-white" style={{ animation: "blink 1.6s infinite" }} />
            <span className="font-outfit text-[13px] text-white tracking-wide">
              Built for Filipino merchants
            </span>
          </div>

          {/* Headline */}
          <div className="mt-4 w-full max-w-[580px]">
            <h1
              className="hero-fade flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-none"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="font-outfit font-semibold text-[22px] sm:text-[26px] text-white tracking-tight">
                BUILD YOUR
              </span>
              <span
                className="text-[36px] sm:text-[44px] md:text-[48px] text-[#1B1818] tracking-tight"
                style={{ fontFamily: SERIF, fontWeight: 400 }}
              >
                BUSINESS
              </span>
              <span
                className="hero-anim font-outfit font-semibold text-[18px] text-white inline-block"
                style={{ animation: "sparkle 3s ease-in-out infinite" }}
              >
                +
              </span>
            </h1>

            {/* Subtext */}
            <p
              className="hero-fade font-outfit font-light text-[14px] sm:text-[15px] leading-[22px] text-white/70 mt-3 max-w-[420px]"
              style={{ animationDelay: "0.35s" }}
            >
              Manipu gives you a fully working online store to build and design
              your product —
            </p>
          </div>

          {/* Action Buttons */}
          <div className="hero-fade mt-6 flex flex-wrap gap-3" style={{ animationDelay: "0.5s" }}>
            <button
              type="button"
              className="group h-[40px] px-4 flex items-center gap-[8px] bg-[#067656]/[0.75] border border-black/60 rounded-[39px] hover:bg-[#067656] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 cursor-pointer"
            >
              <span className="font-outfit font-semibold text-[14px] text-white">Get Started</span>
              <svg className="transition-transform duration-300 group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 17l5-5-5-5M15 12H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              className="group h-[40px] px-4 flex items-center gap-[8px] bg-[#067656]/[0.75] border border-black/60 rounded-[39px] hover:bg-[#067656] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 cursor-pointer"
            >
              <span className="font-outfit font-semibold text-[14px] text-white">Our Product</span>
              <svg className="transition-transform duration-500 group-hover:rotate-[20deg]" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l4.5 2.6v5.2L12 12.4 7.5 9.8V4.6L12 2z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M5.5 12.6l4.5 2.6v5.2L5.5 23 1 20.4v-5.2l4.5-2.6z" transform="translate(0 -2)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M18.5 12.6l4.5 2.6v5.2L18.5 23 14 20.4v-5.2l4.5-2.6z" transform="translate(0 -2)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* BUNNY LAYER — parehong pwesto, STEADY na (walang float, walang sensor) */}
        <div className="mt-10 lg:mt-0 w-full lg:w-auto lg:absolute lg:right-[28%] lg:top-[100%] lg:-translate-y-1/2 flex justify-center items-center">
          <div
            className="w-[140px] sm:w-[380px] md:w-[390px] h-[450px] relative flex items-center justify-center"
            style={{ perspective: "900px" }}
          >
            {/* Soft white glow sa likod */}
            <div
              className="hero-anim absolute inset-x-[10%] top-[8%] bottom-[10%] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)",
                animation: "glowPulse 4s ease-in-out infinite",
              }}
            />

            {/* 3D orbit rings sa paanan */}
            <div
              className="absolute left-1/2 bottom-[2%] w-[330px] h-[330px] -translate-x-1/2 pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="hero-anim absolute inset-0 rounded-full border border-dashed border-white/60"
                style={{ transform: "rotateX(72deg)", animation: "ringSpin 14s linear infinite" }}
              />
              <div
                className="hero-anim absolute inset-[34px] rounded-full border border-white/35"
                style={{ transform: "rotateX(72deg)", animation: "ringSpinRev 20s linear infinite" }}
              />
              <div
                className="hero-anim absolute inset-[78px] rounded-full border border-dotted border-white/50"
                style={{ transform: "rotateX(72deg)", animation: "ringSpin 9s linear infinite" }}
              />
            </div>

            {/* Static na anino sa lupa */}
            <div className="absolute left-1/2 bottom-[5%] w-[150px] h-[14px] -translate-x-1/2 rounded-[50%] bg-black/40 blur-md pointer-events-none" />

            {/* KUNEHO — steady */}
            <div
              className="absolute inset-0"
              style={{ filter: "drop-shadow(0 18px 22px rgba(0,0,0,.35))" }}
            >
              <Image
                src="https://res.cloudinary.com/nresxj0f/image/upload/v1792920525/bunny1.png"
                alt="Manipu Bunny Character"
                fill
                priority
                sizes="(max-w-768px) 280px, (max-w-1024px) 480px, 520px"
                className="object-contain"
              />
            </div>

            {/* Floating tags */}
            <div
              className="hero-anim hidden sm:flex absolute -left-[6%] top-[22%] items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white border border-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 pointer-events-none"
              style={{ animation: "tagFloatA 5s ease-in-out infinite" }}
            >
              <span className="w-[5px] h-[5px] bg-white" style={{ animation: "blink 1.2s infinite" }} />
              Lvl 99
            </div>
            <div
              className="hero-anim hidden sm:flex absolute -right-[4%] top-[36%] items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white border border-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 pointer-events-none"
              style={{ animation: "tagFloatB 5.5s ease-in-out infinite" }}
            >
              Aura +80
            </div>
            <div
              className="hero-anim hidden sm:flex absolute -left-[2%] bottom-[24%] items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white border border-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 pointer-events-none"
              style={{ animation: "tagFloatB 6s ease-in-out infinite" }}
            >
              Skull Crew
            </div>
            <div
              className="hero-anim hidden sm:flex absolute -right-[8%] bottom-[16%] items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white border border-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 pointer-events-none"
              style={{ animation: "tagFloatA 4.8s ease-in-out infinite" }}
            >
              Class S
            </div>

            {/* Sparkles */}
            {[
              { l: "14%", t: "12%", d: "0s" },
              { l: "82%", t: "18%", d: "0.8s" },
              { l: "90%", t: "62%", d: "1.6s" },
              { l: "6%", t: "58%", d: "2.2s" },
            ].map((s, i) => (
              <span
                key={i}
                className="hero-anim absolute text-white font-mono text-[16px] leading-none pointer-events-none"
                style={{ left: s.l, top: s.t, animation: `sparkle 3.2s ease-in-out ${s.d} infinite` }}
              >
                +
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GAME CHARACTER CARD (pareho ng pwesto: right-29 top-28) */}
      <div
        className="hidden md:block absolute right-29 top-28 z-20 w-[210px] font-mono select-none"
        style={{ perspective: "800px" }}
      >
        <div
          style={{
            transform: `rotateY(${tilt.x * 0.5}deg) rotateX(${tilt.y * 0.5}deg)`,
            transition: "transform .25s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* LEVEL + FIGHTER */}
          <div className="hero-fade flex items-start gap-3 pb-3 border-b border-white/20" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col items-start">
              <span className="font-black text-[46px] leading-none tracking-tight tabular-nums text-white">
                {level}
              </span>
              <span className="mt-1 bg-white text-[#067656] text-[9px] font-bold tracking-[0.25em] px-2 py-[2px]">
                LEVEL
              </span>
            </div>
            <div className="flex flex-col pt-1">
              <span className="text-white text-[15px] tracking-widest uppercase">Fighter</span>
              <span className="text-white/70 text-[11px] mt-1">
                Class <span className="font-sans font-black text-white">S</span>
              </span>
            </div>
          </div>

          {/* STATS + SCROLLBAR */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 flex flex-col gap-4">
              <StatRow label="Difficulty" value={260} w={85} i={0} />
              <StatRow label="Aura" value={80} w={40} i={1} />
              <StatRow label="Standard" value={150} w={65} i={2} />
              <StatRow label="Quality" value={220} w={75} i={3} />
            </div>
            <div className="relative w-[2px] bg-white/20 self-stretch">
              <span
                className="hero-anim absolute left-0 w-full h-[38%] bg-white"
                style={{ animation: "thumbSlide 6s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="hero-fade mt-5" style={{ animationDelay: "1.05s" }}>
            <span className="font-sans text-[11px] text-white/70">Skills</span>
            <div className="flex gap-3 mt-2" style={{ transformStyle: "preserve-3d" }}>
              {SKILLS.map((icon, i) => (
                <div
                  key={i}
                  className="hero-anim w-[44px] h-[44px] flex items-center justify-center border border-white/40 bg-white/10 backdrop-blur-sm cursor-pointer transition-transform duration-300 hover:[transform:rotateY(28deg)_rotateX(-8deg)_translateZ(12px)] hover:bg-white/20"
                  style={{ animation: `skillPulse 3s ease-in-out ${i * 0.6}s infinite` }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}