 "use client";

import { useEffect, useRef } from "react";
import { cldUrl } from "@/lib/cloudinary";

// Ilagay dito ang mga larawan mo. Puwede ang alinman sa dalawa:
//  - Cloudinary public ID, hal. "manipu/projects/look-1"
//  - buong URL o file sa /public, hal. "/fashion/look-1.jpg"
// Kapag walang laman o walang Cloudinary setup, gray placeholder muna ang lalabas.
const IMAGES: string[] = Array.from(
  { length: 12 },
  (_, i) => `manipu/projects/look-${i + 1}`
);

const resolveImage = (src: string) =>
  src.startsWith("/") || src.startsWith("http") ? src : cldUrl(src, 800, 1100);

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ProjectsGallery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Direktang DOM update (walang React re-render bawat frame)
    const handleProgress = (p: number) => {
      const reveal = easeOut(clamp((p - 0.82) / 0.18));
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform = `translateY(${(1 - reveal) * 100}%)`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - clamp(p / 0.08));
      }
    };

    import("./ProjectsScene")
      .then(({ createProjectsScene }) => {
        if (cancelled) return;
        cleanup = createProjectsScene(canvas, {
          images: IMAGES.map(resolveImage).filter(Boolean),
          onProgress: handleProgress,
        });
      })
      .catch((error) => console.error("Gallery scene failed to load:", error));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
        aria-label="Interactive fashion gallery. Mag-scroll pababa para makita ang Manipu."
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "28px 30px",
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 600,
            color: "#000",
          }}
        >
          <span>Archive</span>
          <span>Contact</span>
        </div>

        <div
          ref={hintRef}
          style={{
            position: "absolute",
            left: 30,
            bottom: 28,
            fontSize: 12,
            color: "#777",
          }}
        >
          Scroll pababa
        </div>

        {/* Malaking MANIPU sa pinakababa, lalabas sa dulo ng scroll */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          <h1
            ref={wordmarkRef}
            style={{
              margin: 0,
              transform: "translateY(100%)",
              willChange: "transform",
              fontSize: "23vw",
              fontWeight: 500,
              lineHeight: 0.8,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
              textAlign: "center",
              color: "#05060a",
              paddingBottom: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            Manipu
          </h1>
        </div>
      </div>
    </div>
  );
}