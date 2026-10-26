  import React from "react";

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

/* Pinasimpleng brand icons na may pinagandang sukat at kulay */
function ShopeeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
      <path d="M2 7h18l-1.2 14a2 2 0 0 1-2 1.8H5.2a2 2 0 0 1-2-1.8L2 7z" fill="#EE4D2D" />
      <path d="M7 7a4 4 0 0 1 8 0" stroke="#EE4D2D" strokeWidth="1.8" fill="none" />
      <text x="11" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Arial">S</text>
    </svg>
  );
}
function ShopifyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
      <path d="M3 7h16l-1.2 14a2 2 0 0 1-2 1.8H6.2a2 2 0 0 1-2-1.8L3 7z" fill="#95BF47" />
      <path d="M7.5 7a3.5 3.5 0 0 1 7 0" stroke="#5E8E3E" strokeWidth="1.8" fill="none" />
      <text x="11" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Arial">S</text>
    </svg>
  );
}
function LazadaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l9 5v9l-9 5-9-5V8l9-5z" fill="#F57224" />
      <path d="M12 3l9 5-9 5-9-5 9-5z" fill="#FF3B8D" />
      <path d="M12 13v9l-9-5V8l9 5z" fill="#2E2BA0" />
    </svg>
  );
}
function MessengerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2C6.5 2 2 6.1 2 11.3c0 2.9 1.4 5.4 3.6 7.1V22l3.3-1.8c1 .3 2 .4 3.1.4 5.5 0 10-4.1 10-9.3S17.500 2 12 2z" fill="#0A7CFF" />
      <path d="M5.800 14.200l4.200-4.400 2.400 2.300 4-2.300-4.200 4.500-2.400-2.300-4 2.200z" fill="#fff" />
    </svg>
  );
}

const SOURCES = [
  { name: "Shopee", color: "#EE4D2D", Icon: ShopeeIcon },
  { name: "Shopify", color: "#477332", Icon: ShopifyIcon }, // Ginawang mas madilim ng konti para madaling basahin
  { name: "Lazada", color: "#1A1580", Icon: LazadaIcon }, // Pinagandang tono ng asul
  { name: "Messenger", color: "#0062D1", Icon: MessengerIcon },
];

export default function ContentSection() {
  return (
    <>
      {/* Glow sa gitna */}
      <div className="absolute left-[470px] top-[300px] w-[560px] h-[500px] bg-[#0E9770] rounded-full blur-[180px] pointer-events-none z-[5] opacity-60" />

      {/* M logo */}
      <div className="absolute left-[44px] top-[826px] w-[84px] h-[84px] z-20 select-none">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" aria-hidden>
          <path d="M8 92V30L34 8v50l16 14 16-14V8l26 22v62H78V44L50 82 22 44v48H8z" fill="#0D0B0B" />
        </svg>
      </div>

      {/* Tagline */}
      <p
        className="absolute left-[44px] top-[924px] w-[520px] text-[22px] leading-[32px] text-black/75 z-20"
        style={{ fontFamily: SERIF }}
      >
        A store and forum for{" "}
        <span className="font-semibold text-[#08936C]">E-commerce</span>
        <br />
        <span className="font-semibold text-[#08936C]">reflection for customers—</span>
      </p>

      {/* 
        BAGONG GLASSMORPHISM FLOATING CARD FOR SOURCES
        - Binago ang simpleng text at ginawang eleganteng glass container.
        - Gumamit ng backdrop-blur at banayad na shadow para maging mukhang premium.
      */}
      <div className="absolute left-[990px] top-[780px] w-[420px] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[28px] p-6 shadow-xl z-20">
        
        {/* Header Title sa loob ng card */}
        <div className="mb-4">
          <h3 className="font-outfit font-semibold text-[13px] tracking-widest text-black/40 uppercase">
            Supported Integrations
          </h3>
          <p className="font-outfit font-medium text-[16px] text-black/80 mt-0.5">
            Connect your favorite stores
          </p>
        </div>

        {/* Grid ng mga Brand Sources */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {SOURCES.map(({ name, color, Icon }) => (
            <div 
              key={name} 
              className="flex items-center gap-[12px] bg-white/60 border border-white/40 rounded-[18px] p-3 hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Icon />
              </div>
              <span
                className="font-outfit font-semibold text-[15px] tracking-tight"
                style={{ color }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}