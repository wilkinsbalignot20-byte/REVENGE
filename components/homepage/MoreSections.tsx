 import React from "react";
import { cacheLife } from "next/cache"; // Inimport ang cacheLife para sa Next.js 16 cache
import { Reveal, TiltCard } from "./Motion";

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

const FEATURES = [
  { icon: "🏬", title: "Ready-made online store", text: "Launch a working storefront in minutes. No coding needed." },
  { icon: "🔗", title: "All channels, one place", text: "Pull orders and chats from Shopee, Shopify, Lazada and Messenger." },
  { icon: "💬", title: "Merchant forum", text: "Ask, share and learn from other Filipino sellers." },
  { icon: "💳", title: "GCash, Maya & COD", text: "Local payment options your customers already trust." },
  { icon: "🚚", title: "Shipping made simple", text: "Compare couriers and track every parcel nationwide." },
  { icon: "📈", title: "Sales insights", text: "See what sells, when it sells, and who keeps coming back." },
];

const STEPS = [
  { n: "01", title: "Create your store", text: "Sign up and pick a design for your products." },
  { n: "02", title: "Connect your channels", text: "Link Shopee, Lazada, Shopify and Messenger." },
  { n: "03", title: "Start selling", text: "Manage orders, replies and growth from one dashboard." },
];

const STATS = [
  { v: "10k+", l: "Merchants" },
  { v: "250k", l: "Orders managed" },
  { v: "4", l: "Connected platforms" },
  { v: "24/7", l: "Store uptime" },
];

// Gumawa ng cached function para ligtas na makuha ang kasalukuyang taon sa prerendering
async function getCurrentYear() {
  "use cache";
  cacheLife("max"); // Ibe-bake nito ang taon sa static HTML habang nagbi-build
  return new Date().getFullYear();
}

// Ginawang `async` function ang component para magamit ang `await` sa itaas
export default async function MoreSections() {
  const currentYear = await getCurrentYear(); // Tinawag ang cached function

  return (
    <div className="bg-[#EEF2F0] text-[#0D0B0B] font-outfit">
      {/* Stats */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.08} className="text-center">
            <div className="text-[44px] leading-none text-[#067656]" style={{ fontFamily: SERIF }}>{s.v}</div>
            <div className="mt-2 text-[15px] text-black/60">{s.l}</div>
          </Reveal>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1200px] px-6 py-16">
        <Reveal>
          <p className="text-[14px] tracking-widest text-[#067656] font-medium">FEATURES</p>
          <h2 className="mt-3 text-[40px] leading-tight max-w-[640px]" style={{ fontFamily: SERIF }}>
            Everything a Filipino merchant needs to grow
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <TiltCard className="h-full rounded-[24px] bg-white/80 border border-black/10 p-7 shadow-[0_8px_30px_rgba(6,118,86,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#067656]/10 text-[24px]">{f.icon}</div>
                <h3 className="mt-5 text-[20px] font-semibold">{f.title}</h3>
                <p className="mt-2 text-[16px] leading-[24px] text-black/65">{f.text}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#067656] text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <Reveal>
            <p className="text-[14px] tracking-widest text-white/70 font-medium">HOW IT WORKS</p>
            <h2 className="mt-3 text-[40px] leading-tight" style={{ fontFamily: SERIF }}>Three steps to your first sale</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="rounded-[24px] bg-white/10 border border-white/20 p-8 backdrop-blur">
                  <span className="text-[44px] text-white/40" style={{ fontFamily: SERIF }}>{s.n}</span>
                  <h3 className="mt-4 text-[22px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[16px] leading-[24px] text-white/75">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
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
      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-[14px] text-black/60 md:flex-row">
          <span className="text-[20px] font-semibold text-black">
            MAN<span className="text-[#067656]">IPU</span>/
          </span>
          <nav className="flex gap-6">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#how" className="hover:text-black">How it works</a>
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
          </nav>
          {/* Ginamit ang ligtas na `currentYear` variable dito */}
          <span>© {currentYear} Manipu. Made in the Philippines 🇵🇭</span>
        </div>
      </footer>
    </div>
  );
}
