 import type { Metadata } from "next";
import { Playfair_Display, Nunito, Comfortaa } from "next/font/google";
import "../styles/globals.css";
import React from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Wilkins Balignot | Full Stack Developer",
  description: "Portfolio of Wilkins Balignot",
};

// ISANG DEFAULT FUNCTION LANG DAPAT ANG NANDITO:
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${nunito.variable} ${comfortaa.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
