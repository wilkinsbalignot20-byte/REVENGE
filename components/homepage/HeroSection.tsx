 import React from "react";
import Navbar from "./Navbar";
import Image from "next/image"; // Siguraduhing naka-import ito para sa optimized image loading

const SERIF = "var(--font-serif), 'Newsreader', Georgia, serif";

export default function HeroSection() {
  return (
    // Nananatiling relative ang section para magsilbing anchor ng kuneho
    <section className="relative min-h-[65vh] bg-[#067656] text-white pt-24 pb-10 overflow-hidden flex items-center">
      <Navbar />

      {/* 
        ========================================================================
        KUNEHO MULA SA CLOUDINARY (BACKGROUND LAYER)
        - `z-0`: Inilalagay nito ang kuneho sa pinakalikod ng mga teksto.
        - `pointer-events-none`: Para hindi nito maharangan ang pag-click sa mga button.
        - Palitan ang `YOUR_CLOUD_NAME` at `your-bunny-asset-id` ng tunay mong Cloudinary details.
        ========================================================================
      */}
      <div className="absolute left-[8%] md:left-[12%] top-[25%] md:top-[20%] z-0 pointer-events-none w-[280px] sm:w-[350px] md:w-[420px] aspect-square opacity-80">
        <Image
          src="https://res.cloudinary.com/nresxj0f/image/upload/v1792920525/bunny1.png"
          alt="Cloudinary Bunny Background"
          fill
          priority
          sizes="(max-w-768px) 280px, (max-w-1024px) 350px, 420px"
          className="object-contain object-left-top"
        />
      </div>

      {/* 
        TEXT AT CONTENT LAYER
        - Tinaasan natin ang `z-index` papuntang `z-10` para siguradong nakalutang sa harap ng kuneho.
      */}
      <div className="relative mx-auto w-full max-w-[1200px] px-12 z-10">
        
        {/* KALIWANG BAHAGI: Teksto at Buttons */}
        <div className="w-full lg:w-[60%] flex flex-col items-start">
          
          {/* Badge */}
          <div className="h-[32px] flex items-center bg-white/10 border border-white/20 rounded-[30px] px-[12px]">
            <span className="font-outfit text-[13px] text-white tracking-wide">
              Built for Filipino merchants
            </span>
          </div>

          {/* Headline */}
          <div className="mt-4 w-full max-w-[580px]">
            <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-none">
              <span className="font-outfit font-semibold text-[22px] sm:text-[26px] text-white tracking-tight">
                BUILD YOUR
              </span>
              <span
                className="text-[36px] sm:text-[44px] md:text-[48px] text-[#1B1818] tracking-tight"
                style={{ fontFamily: SERIF, fontWeight: 400 }}
              >
                BUSINESS
              </span>
              <span className="font-outfit font-semibold text-[18px] text-white">
                +
              </span>
            </h1>

            {/* Subtext */}
            <p className="font-outfit font-light text-[14px] sm:text-[15px] leading-[22px] text-white/70 mt-3 max-w-[420px]">
              Manipu gives you a fully working online store to build and design
              your product —
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* CTA: Get Started */}
            <button
              type="button"
              className="h-[40px] px-4 flex items-center gap-[8px] bg-[#067656]/[0.75] border border-black/60 rounded-[39px] hover:bg-[#067656] transition-colors cursor-pointer"
            >
              <span className="font-outfit font-semibold text-[14px] text-white">Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 17l5-5-5-5M15 12H3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* CTA: Our Product */}
            <button
              type="button"
              className="h-[40px] px-4 flex items-center gap-[8px] bg-[#067656]/[0.75] border border-black/60 rounded-[39px] hover:bg-[#067656] transition-colors cursor-pointer"
            >
              <span className="font-outfit font-semibold text-[14px] text-white">Our Product</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2l4.5 2.6v5.2L12 12.4 7.5 9.8V4.6L12 2z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M5.5 12.6l4.5 2.6v5.2L5.5 23 1 20.4v-5.2l4.5-2.6z" transform="translate(0 -2)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M18.5 12.6l4.5 2.6v5.2L18.5 23 14 20.4v-5.2l4.5-2.6z" transform="translate(0 -2)" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>

        {/* 3D Animation Box Glassmorphism */}
        <div className="mt-10 lg:mt-0 w-full lg:w-auto lg:absolute lg:right-[28%] lg:top-[100%] lg:-translate-y-1/2 flex justify-center items-center">
          <div className="w-full sm:w-[340px] aspect-[4/3] border border-white/10 rounded-[24px] bg-white/5 backdrop-blur-md flex items-center justify-center p-4 shadow-xl">
            <span className="text-white/30 text-[12px] font-medium tracking-wide text-center">
              [ ILAGAY ANG IYONG 3D ANIMATION DITO ]
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
