 import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProjectsGallery from "@/components/projects-gallery/ProjectsGallery";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Manipu | Projects",
  description: "Manipu projects gallery",
};

export default function ProjectsPage() {
  return (
    <div className={inter.variable}>
      <ProjectsGallery />
    </div>
  );
}