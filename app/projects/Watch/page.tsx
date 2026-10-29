 import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConveyorGallery from "@/components/gallery/ConveyorGallery";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Manipu | Projects",
  description: "Manipu project gallery",
};

export default function WatchPage() {
  return (
    <div className={inter.variable}>
      <ConveyorGallery />
    </div>
  );
}