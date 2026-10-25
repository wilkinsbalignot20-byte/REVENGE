 import React from "react";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-[44px] py-[14px] select-none">
      
      {/* KALIWA: LOGO (MANIPU/) - Pinalit ang font size para maging sleek */}
      <span className="font-outfit font-semibold text-[20px] md:text-[22px] leading-none tracking-tight pointer-events-auto">
        <span className="text-[#070606]">MAN</span>
        <span className="text-white">IPU</span>
        <span className="text-[#070606]">/</span>
      </span>

      {/* GITNA: Nav Links - Mas maliit na text at mas siksik na pagitan */}
      <div className="hidden md:flex items-center gap-6 font-outfit font-medium text-[14px] pointer-events-auto">
        <a href="#" className="text-white hover:text-[#070606] transition-colors duration-200">
          Home
        </a>
        <a href="#about" className="text-white/80 hover:text-[#070606] transition-colors duration-200">
          About
        </a>
        <a href="#store" className="text-white/80 hover:text-[#070606] transition-colors duration-200">
          Store
        </a>
        <a href="#contact" className="text-white/80 hover:text-[#070606] transition-colors duration-200">
          Contact
        </a>
      </div>

      {/* KANAN: /SIDEKICK */}
      <span className="font-outfit font-semibold text-[20px] md:text-[22px] leading-none tracking-tight pointer-events-auto">
        <span className="text-[#070606]">/SIDE</span>
        <span className="text-white">KICK</span>
      </span>

      {/* Guhit ng navbar: Inibaba ang posisyon para sumakto sa slim height */}
      <div className="absolute left-[-3000px] top-[54px] w-[7440px] h-px bg-[#070606]/40 pointer-events-none" />
    </nav>
  );
}
