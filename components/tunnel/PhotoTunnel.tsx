/*
  MIT License
  Copyright (c) Shakuro (shakuro.com)
  
  Original "404 Photo Tunnel" Design and WebGL Animation by Shakuro.
  Created for Per Appelgren Portfolio.
  Ported and adapted for Next.js and TypeScript.
*/

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./tunnel.css";
import ScrambleLink from "./ScrambleLink";
import { tunnelImages } from "./images";
import { cldUrl } from "@/lib/cloudinary";

type NavItem = { label: string; href: string };

type Props = {
  /** Cloudinary public IDs ng mga larawan sa tunnel */
  images?: string[];
  /**
   * Saan pupunta ang "Go home" button.
   * Kapag WALANG ibinigay (demo mode), mananatili ang bisita sa page at may lalabas na paalala.
   * Sa client site: <PhotoTunnel homeUrl="https://client-site.com" />
   */
  homeUrl?: string;
  title?: string;
  message?: string;
  buttonLabel?: string;
  brand?: string;
  leftLink?: NavItem;
  rightLink?: NavItem;
};

export default function PhotoTunnel({
  images = tunnelImages,
  homeUrl,
  title = "404",
  message = "This page no longer exists\nor has been moved",
  buttonLabel = "GO HOME",
  brand = "MANIPU",
  leftLink = { label: "Made by Manipu", href: "#" },
  rightLink = { label: "Project details", href: "#" },
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const goHome = useCallback(() => {
    if (homeUrl) {
      window.location.href = homeUrl;
      return;
    }
    // Demo mode: hindi aalis sa page
    setToast(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 3500);
  }, [homeUrl]);

  const goHomeRef = useRef(goHome);
  useEffect(() => {
    goHomeRef.current = goHome;
  }, [goHome]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const imagesKey = images.join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Dynamic import: hindi isasama ang three.js sa server render
    import("./tunnelScene")
      .then(({ createTunnel }) => {
        if (cancelled) return;
        cleanup = createTunnel(canvas, {
          imageUrls: imagesKey
            ? imagesKey.split("|").map((id) => cldUrl(id, 900, 1200)).filter(Boolean)
            : [],
          title,
          message,
          buttonLabel,
          onButtonClick: () => goHomeRef.current(),
        });
      })
      .catch((error) => console.error("Gallery failed to load:", error));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [imagesKey, title, message, buttonLabel]);

  return (
    <div className="pt-root">
      <main aria-label="Page not found">
        <canvas
          ref={canvasRef}
          className="pt-canvas"
          aria-label={`${title}. ${message.replace(/\n/g, " ")}`}
        />

        <header className="pt-menu">
          <nav aria-label="Main navigation">
            <ScrambleLink className="pt-nav-link" label={leftLink.label} href={leftLink.href} />
            <span className="pt-brand">{brand}</span>
            <ScrambleLink className="pt-nav-link" label={rightLink.label} href={rightLink.href} />
          </nav>
        </header>

        {/* Para sa keyboard / screen reader users */}
        <button type="button" className="pt-home-link" onClick={goHome}>
          {buttonLabel.toLowerCase().replace(/^./, (c) => c.toUpperCase())}
        </button>

        {toast && (
          <p className="pt-toast" role="status">
            Demo mode: set the <code>homeUrl</code> prop to send visitors to the client&apos;s homepage.
          </p>
        )}
      </main>
    </div>
  );
}