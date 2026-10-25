 import React from "react";

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

/* Pinasimpleng brand icons. Palitan ng official SVG assets kung meron ka. */
function ShopeeIcon() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
      <path d="M2 7h18l-1.2 14a2 2 0 0 1-2 1.8H5.2a2 2 0 0 1-2-1.8L2 7z" fill="#EE4D2D" />
      <path d="M7 7a4 4 0 0 1 8 0" stroke="#EE4D2D" strokeWidth="1.8" fill="none" />
      <text x="11" y="19" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Arial">S</text>
    </svg>
  );
}
function ShopifyIcon() {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
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
  { name: "Shopify", color: "#5E8E3E", Icon: ShopifyIcon },
  { name: "Lazada", color: "#2E2BA0", Icon: LazadaIcon },
  { name: "Messenger", color: "#0A7CFF", Icon: MessengerIcon },
];

export default function ContentSection() {
  return (
    <>
      {/* Glow sa gitna (nasa ilalim ng curve at pills) */}
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

      {/* SOURCE panel: curved top-left corner, bukas pababa at pakanan */}
      <div className="absolute left-[1185px] top-[708px] w-[1000px] h-[316px] z-20">
        <span className="absolute left-[56px] top-[14px] font-outfit font-normal text-[24px] leading-[30px] tracking-wide text-black">
          SOURCE -
        </span>

        <ul className="absolute left-[40px] top-[74px] flex flex-col gap-[16px]">
          {SOURCES.map(({ name, color, Icon }) => (
            <li key={name} className="flex items-center gap-[10px]">
              <Icon />
              <span
                className="font-outfit font-medium text-[19px] leading-[26px]"
                style={{ color }}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}