 import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PhotoTunnel from "@/components/tunnel/PhotoTunnel";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Manipu | 404 Photo Tunnel",
  description: "Manipu 404 photo tunnel example",
};

export default function TunnelPage() {
  return (
    <div className={inter.variable}>
      <PhotoTunnel homeUrl="/projects" />
    </div>
  );
}