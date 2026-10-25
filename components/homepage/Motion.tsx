"use client";

import React, { useEffect, useRef, useState } from "react";

/* Lumalabas nang dahan-dahan kapag na-scroll na sa view */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(32px)",
        transition: `opacity .7s ease ${delay}s, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* 3D tilt: sumusunod sa mouse, may glare */
export function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0, gx: 50, gy: 50, on: false });

  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({ x: (0.5 - py) * 14, y: (px - 0.5) * 14, gx: px * 100, gy: py * 100, on: true });
  };

  return (
    <div style={{ perspective: 900 }}>
      <div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={() => setT({ x: 0, y: 0, gx: 50, gy: 50, on: false })}
        className={`relative overflow-hidden ${className}`}
        style={{
          transform: `rotateX(${t.x}deg) rotateY(${t.y}deg) translateZ(0)`,
          transition: t.on ? "transform .08s linear" : "transform .5s ease",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: t.on ? 1 : 0,
            transition: "opacity .3s",
            background: `radial-gradient(240px circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,.55), transparent 60%)`,
          }}
        />
        {children}
      </div>
    </div>
  );
}