 "use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Reveal, TiltCard } from "./Motion";
import ClientBackground from "./ClientBackground";
import { CldImage } from "next-cloudinary";
import { Layers, MessageCircle, Scan } from "lucide-react";

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

// ⚠️ Palitan ng totoong Public ID mula sa Cloudinary Dashboard
const IMG = {
  moodboard: "samples/table",
  product: "conversation", // box: conversation
  channels: "samples/ecommerce/accessories", // box: channels
  agent: "samples/room", // box: AI agent
};

const STEPS = [
  { n: "01", title: "Create your store", text: "Sign up and pick a design for your products." },
  { n: "02", title: "Connect your channels", text: "Link Shopee, Lazada, Shopify and Messenger." },
  { n: "03", title: "Start selling", text: "Manage orders, replies and growth from one dashboard." },
];

/* ------------------------------------------------------------------ */
/* Box3D: mouse-tilt card na may depth layers (translateZ) sa loob.    */
/* Walang background dito, ang box lang ang gumagalaw.                 */
/* ------------------------------------------------------------------ */
const z = (px: number): React.CSSProperties => ({ transform: `translateZ(${px}px)` });

function Box3D({
  children,
  className = "",
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  tone: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 16 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 140, damping: 16 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={`h-full ${className}`} style={{ perspective: 1200 }}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative flex h-full min-h-[440px] flex-col rounded-[32px] border border-white/10 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-9 ${tone}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Chip({
  label,
  dot,
  className,
  depth,
  delay = 0,
}: {
  label: string;
  dot: string;
  className: string;
  depth: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      style={{ z: depth }}
      animate={reduce ? undefined : { y: [0, -7, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute flex items-center gap-2 rounded-full border border-white/15 bg-[#0f1512]/90 px-3.5 py-1.5 text-[12px] font-medium text-white shadow-lg backdrop-blur ${className}`}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {label}
    </motion.div>
  );
}

// ⚠️ Palitan ng totoong Public IDs (maliit na square photos para sa marquee)
const THUMBS = [
  "samples/food/spices",
  "street",
  "shopping",
  "samples/ecommerce/analog-classic",
];

const FEATURES = [
  {
    Icon: Layers,
    title: "One place to run your store",
    text: "Orders, products and customers together, so you can get back to selling.",
  },
  {
    Icon: MessageCircle,
    title: "Replies that move you forward",
    text: "Put the conversation right beside the order. Less copy-pasting, more closing.",
  },
  {
    Icon: Scan,
    title: "Space to make it your own",
    text: "Start with a template or a blank store. Run it your way, with the people you choose.",
  },
];

const ROW_A = ["Online sellers", "Clothing brands", "Coffee shops", "Resellers", "Side hustlers", "Home bakers"];
const ROW_B = ["Thrift stores", "Beauty brands", "Small shops", "Dropshippers", "Growing teams", "Food stalls"];

/* Marquee row: tuloy-tuloy na gumagalaw, may fade sa magkabilang gilid */
function MarqueeRow({
  items,
  reverse = false,
  offset = 0,
  duration = 45,
}: {
  items: string[];
  reverse?: boolean;
  offset?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const fade = "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";

  const half = (
    <div className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((label, i) => (
        <div key={label} className="flex items-center gap-4">
          <div
            className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-zinc-800 shadow-lg ${
              i % 2 ? "rotate-6" : "-rotate-6"
            }`}
          >
            <CldImage
              width="96"
              height="96"
              src={THUMBS[(i + offset) % THUMBS.length]}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <span className="whitespace-nowrap text-[15px] font-medium text-white/90">{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden" style={{ maskImage: fade, WebkitMaskImage: fade }}>
      <motion.div
        className="flex w-max"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {half}
        {half}
      </motion.div>
    </div>
  );
}

export default function MoreSections() {
  const [currentYear, setCurrentYear] = useState<number | string>("2026");
  // Gamitin mo ito mamaya para i-swap ang laman ng bento sa baba (solo / team)
  const [audience, setAudience] = useState<"solo" | "team">("solo");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="relative bg-[#0A0D0C] text-white font-outfit overflow-hidden w-full">
      {/* Background na naka-connect na sa fiber/Motion, hindi ginalaw */}
      <ClientBackground />

      {/* ================== 1. LESS GETTING IN THE WAY ================== */}
      <section className="relative z-10 mx-auto w-full max-w-[1000px] px-6 pt-28">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              className="text-[40px] font-medium leading-[1.1] tracking-tight md:text-[52px]"
              style={{ fontFamily: SERIF }}
            >
              Less juggling apps.<br />More getting orders.
            </h2>
            <p className="max-w-[300px] text-[14px] leading-6 text-white/55 md:pb-2">
              Good stores need room to grow. We give you a simpler place to manage, reply, and sell.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[22px] border border-white/10 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-emerald-500/30 hover:bg-white/[0.04]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/80">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <h3 className="mt-8 text-[15px] font-semibold">{title}</h3>
                <p className="mt-2 text-[13px] leading-5 text-white/50">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================== 2. FOR EVERY SELLER (marquee) ================== */}
      <section className="relative z-10 w-full pt-32">
        <Reveal>
          <h2
            className="text-center text-[36px] font-medium tracking-tight md:text-[44px]"
            style={{ fontFamily: SERIF }}
          >
            For every Filipino seller.
          </h2>
        </Reveal>
        <div className="mx-auto mt-14 flex max-w-[1100px] flex-col gap-8">
          <MarqueeRow items={ROW_A} duration={50} />
          <MarqueeRow items={ROW_B} reverse offset={2} duration={58} />
        </div>
      </section>

      {/* ================== 3. GOOD STORES NEED ROOM (heading + toggle) ================== */}
      <section className="relative z-10 mx-auto w-full max-w-[700px] px-6 pt-32 text-center">
        <Reveal>
          <h2
            className="text-[38px] font-medium leading-[1.12] tracking-tight md:text-[48px]"
            style={{ fontFamily: SERIF }}
          >
            Good stores need<br />a little room to grow.
          </h2>
          <p className="mx-auto mt-5 max-w-[420px] text-[14px] leading-6 text-white/55">
            {audience === "solo"
              ? "From your first product to your hundredth order. Everything belongs in the same place."
              : "From one owner to a whole crew. Everyone sees the same orders, chats and stock."}
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            {(["solo", "team"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setAudience(k)}
                aria-pressed={audience === k}
                className="relative rounded-full px-4 py-1.5 text-[12px] font-medium"
              >
                {audience === k && (
                  <motion.span
                    layoutId="audience-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative transition-colors ${audience === k ? "text-white" : "text-white/45"}`}>
                  {k === "solo" ? "For solo sellers" : "For teams"}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================== BENTO GRID (4 boxes) ================== */}
      <section className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pt-14 pb-12">
        <div className="grid gap-5 md:grid-cols-12">
          {/* ---------- BOX 1: Moodboard (existing) ---------- */}
          <Reveal className="h-full md:col-span-7">
            <TiltCard className="relative flex h-full min-h-[440px] w-full flex-col justify-between rounded-[32px] border border-white/10 bg-zinc-950 p-6 shadow-2xl group overflow-hidden transition-all duration-500 hover:border-emerald-500/30 md:p-10">
              <div className="flex justify-between items-center z-10">
                <span className="text-[11px] tracking-wide font-mono text-zinc-400 bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/5">
                  Generative Canvas / Moodboard
                </span>
                <span className="text-[11px] tracking-wide font-mono text-emerald-400 bg-emerald-950/40 backdrop-blur px-3 py-1.5 rounded-full border border-emerald-800/30 font-medium">
                  Exploration: ON
                </span>
              </div>

              <div className="mt-4 max-w-md z-10">
                <h2
                  className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]"
                  style={{ fontFamily: SERIF }}
                >
                  Make space for<br />possibility.
                </h2>
              </div>

              <div className="absolute right-[15%] top-[35%] z-20 bg-[#e2f1e5] text-[#1b4324] text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg pointer-events-none animate-bounce [animation-duration:3s]">
                Maya
              </div>

              <div className="absolute left-6 bottom-24 md:left-10 md:bottom-28 z-20 max-w-[260px] bg-white text-zinc-900 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-200/80 transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white font-bold">
                    M
                  </div>
                  <p className="text-[11px] font-medium text-zinc-800">
                    Maya <span className="text-zinc-400 font-normal">commented</span>
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 ml-auto" />
                </div>
                <p className="text-[12px] text-zinc-600 font-normal leading-relaxed">
                  “The whole story is coming together.”
                </p>
                <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center text-[10px] text-zinc-400 font-medium">
                  <span>← Resolve comment</span>
                </div>
              </div>

              <div className="flex justify-between items-end w-full mt-auto z-10">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  in this together
                </div>
                <button
                  type="button"
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/10 hover:border-white/20 transition-all duration-300 rounded-full px-4 py-2 flex items-center gap-3 text-[11px] font-medium shadow-inner"
                >
                  <span>Spaces Overview & Canvas</span>
                  <span className="text-zinc-400 text-xs">→</span>
                </button>
              </div>

              <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
                <CldImage
                  width="960"
                  height="720"
                  src={IMG.moodboard}
                  alt="Canvas Moodboard Cloudinary Asset"
                  sizes="100vw"
                  className="w-full h-full object-cover mix-blend-luminosity scale-100 group-hover:scale-[1.02] transition-transform duration-1000 ease-out"
                  priority
                />
              </div>
            </TiltCard>
          </Reveal>

          {/* ---------- BOX 2: "A conversation with context" style ---------- */}
          <Reveal className="h-full md:col-span-5" delay={0.08}>
            <Box3D tone="bg-[#263140]">
              <div style={z(24)}>
                <h3
                  className="text-[28px] font-semibold leading-tight tracking-tight"
                  style={{ fontFamily: SERIF }}
                >
                  A conversation with context.
                </h3>
                <p className="mt-3 max-w-[300px] text-[14px] leading-6 text-white/60">
                  A question, a size, a quick yes. Right beside the product the customer is asking about.
                </p>
              </div>

              <div className="relative mt-8 flex-1 min-h-[250px]" style={{ transformStyle: "preserve-3d" }}>
                {/* product image tile */}
                <div
                  className="absolute left-6 top-0 h-[170px] w-[78%] -rotate-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                  style={z(30)}
                >
                  <CldImage
                    width="640"
                    height="420"
                    src={IMG.product}
                    alt="Product being discussed"
                    sizes="(min-width: 768px) 30vw, 90vw"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* pin */}
                <motion.div
                  style={{ z: 80 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-[42%] top-14 flex h-9 w-9 items-center justify-center rounded-full rounded-bl-none bg-[#3f6f8a] text-[13px] font-semibold shadow-lg"
                >
                  1
                </motion.div>

                {/* message rectangle */}
                <div
                  className="absolute inset-x-0 bottom-0 rounded-2xl border border-white/10 bg-[#1a232e] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.45)]"
                  style={z(70)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-[13px] font-semibold">
                      A
                    </div>
                    <div className="leading-tight">
                      <p className="text-[13px] font-semibold">Ana Reyes</p>
                      <p className="text-[11px] text-white/45">Just now</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] font-medium leading-snug">
                    Available pa po ba ito in medium? Pwede po ba i-deliver sa Cebu?
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/45">One customer waiting.</span>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/10"
                    >
                      ✓ Mark as replied
                    </button>
                  </div>
                </div>
              </div>
            </Box3D>
          </Reveal>

          {/* ---------- BOX 3: Service, all channels ---------- */}
          <Reveal className="h-full md:col-span-5" delay={0.04}>
            <Box3D tone="bg-[#1f2a24]">
              <div style={z(24)}>
                <h3
                  className="text-[28px] font-semibold leading-tight tracking-tight"
                  style={{ fontFamily: SERIF }}
                >
                  Every channel, one dashboard.
                </h3>
                <p className="mt-3 max-w-[320px] text-[14px] leading-6 text-white/60">
                  Orders from Shopee, Lazada, Shopify and Messenger land in one place. No more switching tabs.
                </p>
              </div>

              <div className="relative mt-8 flex-1 min-h-[240px]" style={{ transformStyle: "preserve-3d" }}>
                <div
                  className="absolute inset-x-4 top-4 bottom-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
                  style={{ ...z(20), transform: "translateZ(20px) rotate(3deg)" }}
                >
                  <CldImage
                    width="720"
                    height="480"
                    src={IMG.channels}
                    alt="Manipu dashboard"
                    sizes="(min-width: 768px) 30vw, 90vw"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>
                <Chip label="Live" dot="#ee4d2d" depth={70} className="left-0 top-0" />
                <Chip label="Passion" dot="#4f6bff" depth={90} delay={0.6} className="right-0 top-10" />
                <Chip label="Stay" dot="#95bf47" depth={60} delay={1.1} className="left-6 bottom-12" />
                <Chip label="Bold" dot="#0a84ff" depth={100} delay={1.6} className="right-4 bottom-2" />
              </div>
            </Box3D>
          </Reveal>

          {/* ---------- BOX 4: Service, AI agent + hand-off ---------- */}
          <Reveal className="h-full md:col-span-7" delay={0.12}>
            <Box3D tone="bg-[#2b2622]">
              <div className="relative flex-1 min-h-[250px]" style={{ transformStyle: "preserve-3d" }}>
                <div
                  className="absolute inset-x-0 top-0 h-[78%] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
                  style={{ transform: "translateZ(20px) rotate(-2deg)" }}
                >
                  <CldImage
                    width="900"
                    height="460"
                    src={IMG.agent}
                    alt="AI agent in the seller inbox"
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>

                <motion.div
                  style={{ z: 80 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-4 bottom-0 w-[250px] rounded-2xl border border-white/10 bg-[#1d1a17] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <p className="text-[12px] font-semibold">AI agent replied</p>
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-white/60">
                    “Yes po, available ang medium. Ipapasa ko kay seller para sa shipping.”
                  </p>
                </motion.div>

                <motion.div
                  style={{ z: 110 }}
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute right-4 bottom-6 flex items-center gap-2 rounded-full bg-[#067656] px-4 py-2 text-[12px] font-semibold shadow-lg"
                >
                  Handed off to you ✓
                </motion.div>
              </div>

              <div className="mt-8" style={z(24)}>
                <h3
                  className="text-[28px] font-semibold leading-tight tracking-tight"
                  style={{ fontFamily: SERIF }}
                >
                  Replies that never sleep.
                </h3>
                <p className="mt-3 max-w-[420px] text-[14px] leading-6 text-white/60">
                  Your AI agent answers customers anytime, then hands the chat to your seller inbox when it’s time to close.
                </p>
              </div>
            </Box3D>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <Reveal>
            <p className="text-[14px] tracking-widest text-white/70 font-medium">HOW IT WORKS</p>
            <h2 className="mt-3 text-[40px] leading-tight" style={{ fontFamily: SERIF }}>
              Three steps to your first sale
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="rounded-[24px] bg-white/10 border border-white/20 p-8 backdrop-blur">
                  <span className="text-[44px] text-white/40" style={{ fontFamily: SERIF }}>
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-[22px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[16px] leading-[24px] text-white/75">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-[1200px] px-6 py-20">
        <Reveal>
          <div className="rounded-[32px] bg-[#0D0B0B] px-8 py-16 text-center text-white">
            <h2 className="mx-auto max-w-[620px] text-[40px] leading-tight" style={{ fontFamily: SERIF }}>
              Ready to build your business?
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-white/70">
              Join Filipino merchants already selling smarter with Manipu.
            </p>
            <button
              type="button"
              className="mt-8 h-[52px] rounded-[39px] bg-[#067656] px-8 text-[18px] font-semibold hover:bg-[#08936C] transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-[14px] text-white/60 md:flex-row">
          <span className="text-[20px] font-semibold text-white">
            MAN<span className="text-[#067656]">IPU</span>/
          </span>
          <nav className="flex gap-6">
            <a href="#features" className="hover:text-white text-white/70 transition-colors">Features</a>
            <a href="#how" className="hover:text-white text-white/70 transition-colors">How it works</a>
            <a href="#" className="hover:text-white text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white text-white/70 transition-colors">Terms</a>
          </nav>
          <span>© {currentYear} Manipu. Made in the Philippines 🇵🇭</span>
        </div>
      </footer>
    </div>
  );
}