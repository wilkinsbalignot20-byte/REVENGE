"use client";

import { useCallback, useEffect, useRef } from "react";

type Props = {
  label: string;
  href: string;
  className?: string;
};

/** Link na may letter-scramble effect kapag na-hover. */
export default function ScrambleLink({ label, href, className }: Props) {
  const originalRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scrambleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef(new Map<number, number>());
  const letters = [...label];

  const restore = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current.clear();
    originalRefs.current.forEach((el) => {
      if (el) el.style.visibility = "";
    });
    scrambleRefs.current.forEach((el) => {
      if (el) el.textContent = "";
    });
  }, []);

  useEffect(() => {
    window.addEventListener("blur", restore);
    return () => {
      window.removeEventListener("blur", restore);
      restore();
    };
  }, [restore]);

  const start = () => {
    restore();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    letters.forEach((letter, index) => {
      if (letter === " ") return;
      const pool = /[a-z]/i.test(letter)
        ? letter === letter.toUpperCase()
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          : "abcdefghijklmnopqrstuvwxyz"
        : /\d/.test(letter)
          ? "0123456789"
          : "+-.@_/";
      let cycles = 0;
      const runCycle = () => {
        const original = originalRefs.current[index];
        const scramble = scrambleRefs.current[index];
        if (!original || !scramble) return;
        if (++cycles === 3) {
          original.style.visibility = "";
          scramble.textContent = "";
          timers.current.delete(index);
          return;
        }
        let next: string;
        do {
          next = pool[Math.floor(Math.random() * pool.length)];
        } while (next === letter);
        original.style.visibility = "hidden";
        scramble.textContent = next;
        timers.current.set(index, window.setTimeout(runCycle, 40));
      };
      timers.current.set(index, window.setTimeout(runCycle, index * 30));
    });
  };

  const isPlaceholder = href === "#" || href === "";

  return (
    <a
      className={className}
      href={href || "#"}
      aria-label={label}
      onMouseEnter={start}
      onMouseLeave={restore}
      // Demo mode: ang "#" na link ay hindi aalis sa page
      onClick={isPlaceholder ? (event) => event.preventDefault() : undefined}
      {...(!isPlaceholder && /^https?:/.test(href)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          className="pt-nav-letter"
          style={{ "--letter-index": index } as React.CSSProperties}
          aria-hidden="true"
        >
          <span ref={(el) => { originalRefs.current[index] = el; }}>
            {letter === " " ? "\u00a0" : letter}
          </span>
          <span
            className="pt-nav-letter-scramble"
            ref={(el) => { scrambleRefs.current[index] = el; }}
          />
        </span>
      ))}
    </a>
  );
}