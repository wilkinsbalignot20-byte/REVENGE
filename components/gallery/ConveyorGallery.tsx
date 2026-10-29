"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./gallery.css";
import { cldUrl, projects } from "./projects";
import {
  advanceMotion,
  createConveyor,
  createNoise,
  layoutViewport,
  staticNoise,
  wrap,
  type Conveyor,
  type Motion,
} from "./webgl";

const IMAGE_TIMEOUT_MS = 12000;

/** Naglo-load ng larawan. Hindi kailanman nag-rereject: null ang balik kapag pumalya o natagalan. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const image = new Image();
    image.crossOrigin = "anonymous"; // kailangan ng WebGL texture
    const timer = window.setTimeout(() => resolve(null), IMAGE_TIMEOUT_MS);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image.naturalWidth > 0 ? image : null);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    image.src = src;
  });
}

export default function ConveyorGallery() {
  const stageRef = useRef<HTMLElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const app = appRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const noiseCanvas = noiseRef.current;
    const status = statusRef.current;
    if (!app || !stage || !canvas || !noiseCanvas || !status) return;

    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion: Motion = {
      offset: 0,
      velocity: 0,
      present: 0,
      targetPresent: 0,
      pointerX: 0,
      pointerY: 0,
      parallaxX: 0,
      parallaxY: 0,
    };
    let conveyor: Conveyor | null = null;
    let previousTime = 0;
    let animationFrame = 0;
    let touch: { id: number; y: number; startX: number; startY: number } | null = null;
    let dragged = false;
    let noise = createNoise(noiseCanvas);

    const cleanups: Array<() => void> = [];
    const listen = (
      target: EventTarget,
      type: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: (event: any) => void,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, options);
      cleanups.push(() => target.removeEventListener(type, handler, options));
    };

    function message(text: string) {
      status!.textContent = text;
      status!.hidden = !text;
    }

    function fallback(reason: string) {
      conveyor = null;
      app!.classList.add("is-fallback");
      message("3D rendering is unavailable. Explore the projects below.");
      console.warn("Conveyor gallery:", reason);
    }

    function resize() {
      noise.resize();
      const { scale, width } = layoutViewport(window.innerWidth, window.innerHeight);
      stage!.style.setProperty("--stage-scale", String(scale));
      stage!.style.setProperty("--stage-width", `${width}px`);
      conveyor?.resize(window.innerWidth, window.innerHeight);
    }

    function input(delta: number, touchInput = false) {
      if (!conveyor) return;
      const sensitivity = touchInput ? 0.00155 : 0.00019;
      if (reducedMotion.matches)
        motion.offset = wrap(
          motion.offset + (delta * sensitivity * 0.94) / 0.06,
          projects.length
        );
      else motion.velocity += delta * sensitivity;
      motion.targetPresent = Math.max(
        0,
        Math.min(1, motion.targetPresent + delta * (touchInput ? 0.0024 : 0.00033))
      );
      canvas!.style.cursor = "";
    }

    function render(time: number) {
      const frames = previousTime
        ? Math.min((time - previousTime) / (1000 / 60), 3)
        : 1;
      previousTime = time;
      advanceMotion(motion, frames, projects.length, reducedMotion.matches);
      noise.draw(reducedMotion.matches ? 0 : time);
      conveyor?.draw(motion);
      animationFrame = requestAnimationFrame(render);
    }

    // ---- Events ----
    listen(
      window,
      "wheel",
      (event: WheelEvent) => {
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        input(event.deltaY * unit);
      },
      { passive: true }
    );
    listen(app, "pointerdown", (event: PointerEvent) => {
      dragged = false;
      if (!conveyor || event.pointerType === "mouse" || (event.target as Element).closest("a")) return;
      touch = { id: event.pointerId, y: event.clientY, startX: event.clientX, startY: event.clientY };
      app.setPointerCapture(event.pointerId);
    });
    listen(app, "pointermove", (event: PointerEvent) => {
      if (touch?.id === event.pointerId) {
        input(touch.y - event.clientY, true);
        touch.y = event.clientY;
        dragged ||=
          Math.hypot(touch.startX - event.clientX, touch.startY - event.clientY) > 6;
      } else if (event.pointerType === "mouse") {
        motion.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        motion.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
        if (conveyor && Math.abs(motion.velocity) < 0.001) {
          const slot = conveyor.pick(event.clientX, event.clientY, motion);
          canvas.style.cursor = slot >= 0 ? "pointer" : "";
        }
      }
    });
    listen(app, "pointerup", () => { touch = null; });
    listen(app, "pointercancel", () => { touch = null; dragged = true; });
    listen(app, "lostpointercapture", () => { touch = null; });
    listen(app, "click", (event: MouseEvent) => {
      if (!conveyor || (event.target as Element).closest("a") || dragged) return;
      const slot = conveyor.pick(event.clientX, event.clientY, motion);
      if (slot >= 0) window.open(projects[slot].url, "_blank", "noopener,noreferrer");
    });
    listen(app, "pointerleave", () => {
      motion.pointerX = motion.pointerY = 0;
      canvas.style.cursor = "";
    });
    listen(window, "keydown", (event: KeyboardEvent) => {
      if (!conveyor || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (reducedMotion.matches)
        motion.offset = wrap(motion.offset + direction, projects.length);
      else motion.velocity += (direction * 0.06) / 0.94;
      motion.targetPresent = Math.max(0, Math.min(1, motion.targetPresent + direction * 0.12));
    });
    listen(document, "visibilitychange", () => {
      cancelAnimationFrame(animationFrame);
      previousTime = 0;
      if (!document.hidden) animationFrame = requestAnimationFrame(render);
    });
    listen(canvas, "webglcontextlost", (event: Event) => {
      event.preventDefault();
      fallback("WebGL context lost.");
    });
    listen(canvas, "webglcontextrestored", () => void initialize());
    listen(noiseCanvas, "webglcontextlost", (event: Event) => {
      event.preventDefault();
      staticNoise(noiseCanvas);
    });
    listen(noiseCanvas, "webglcontextrestored", () => {
      noise = createNoise(noiseCanvas);
      resize();
    });
    listen(window, "resize", resize);

    // ---- Load ng mga larawan mula sa Cloudinary ----
    const loaded = Promise.all(projects.map((p) => loadImage(cldUrl(p.publicId))));

    async function initialize() {
      const textures = await loaded;
      if (disposed) return;
      try {
        conveyor = createConveyor(canvas!, textures, projects);
        app!.classList.remove("is-fallback");
        const missing = textures.filter((image) => !image).length;
        message(
          missing
            ? `${missing} project image(s) could not load. Their links remain available.`
            : ""
        );
        resize();
      } catch (error) {
        fallback(error instanceof Error ? error.message : String(error));
      }
    }

    resize();
    animationFrame = requestAnimationFrame(render);
    void initialize();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="mg-root">
      <main className="mg-stage" ref={stageRef} aria-label="Manipu project gallery">
        <canvas className="mg-noise" ref={noiseRef} aria-hidden="true" />
        <div className="mg-glow" aria-hidden="true" />
        <div className="mg-wordmark" aria-hidden="true">
          <svg viewBox="0 0 1888 377" xmlns="http://www.w3.org/2000/svg">
            <text
              x="0"
              y="335"
              fill="#fff"
              fontSize="440"
              fontWeight="700"
              textLength="1888"
              lengthAdjust="spacingAndGlyphs"
              style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
            >
              MANIPU
            </text>
          </svg>
        </div>
        <div className="mg-bottom-shade" aria-hidden="true" />
      </main>

      <div
        className="mg-app"
        ref={appRef}
        role="region"
        aria-label="Scroll, swipe or use arrow keys to explore Manipu projects"
      >
        <canvas className="mg-conveyor" ref={canvasRef} aria-hidden="true" />
        <div className="mg-project-links">
          {projects.map((project) => {
            const src = cldUrl(project.publicId);
            return (
              <a
                key={project.id}
                className="mg-project-link"
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title}`}
              >
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={project.title} draggable={false} />
                )}
                <span>{project.title}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="mg-agency">
        <p>Manipu — online store and forum</p>
        <p className="mg-since">for Filipino merchants</p>
      </div>
      <nav className="mg-socials" aria-label="Manipu links">
        <Link href="/">home</Link>
        <span>/</span>
        <Link href="/projects">projects</Link>
      </nav>
      <p className="mg-status" role="status" ref={statusRef} hidden />
    </div>
  );
}