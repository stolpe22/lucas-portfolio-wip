import { useEffect, useMemo, useRef } from "react";
import type { SiteContent } from "../../types/content";

interface HeroProps {
  hero: SiteContent["hero"];
  wordmarkAlt: string;
  scrollHint: string;
}

const DAG_NODES: Array<[number, number]> = [
  [120, 140], [340, 90], [860, 200], [180, 380], [420, 340],
  [700, 120], [860, 320], [980, 160], [760, 420], [1060, 420],
  [260, 560], [520, 540], [900, 560],
];

const DAG_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [4, 5], [5, 6], [2, 6],
  [6, 7], [6, 8], [8, 9], [3, 10], [10, 11], [4, 11], [8, 12],
];

function resolvePublicSrc(src: string | undefined) {
  if (!src) return src;
  return src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;
}

const GLOW_SIZE = 420;

export function Hero({ hero, wordmarkAlt, scrollHint }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const dagRef = useRef<HTMLDivElement | null>(null);
  const photoWrapRef = useRef<HTMLDivElement | null>(null);
  const headLeftRef = useRef<HTMLImageElement | null>(null);
  const headRightRef = useRef<HTMLImageElement | null>(null);
  const photoSrc = resolvePublicSrc(hero.photo);
  const headSrc = resolvePublicSrc(hero.photoHead);
  const headRightSrc = resolvePublicSrc(hero.photoHeadRight);
  const bodySrc = resolvePublicSrc(hero.photoBody);

  const dagSvg = useMemo(() => {
    const lines = DAG_EDGES.map(([a, b]) => {
      const [x1, y1] = DAG_NODES[a];
      const [x2, y2] = DAG_NODES[b];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#heroLineGrad)" stroke-width="1.4" fill="none" opacity="0.45"/>`;
    }).join("");

    const nodes = DAG_NODES.map((node, index) => {
      const radius = 3 + (index % 3);
      const delay = (index * 0.28).toFixed(2);
      return `<circle cx="${node[0]}" cy="${node[1]}" r="${radius}" fill="var(--violet-glow)" style="transform-origin:center;transform-box:fill-box;animation:node-pulse 3.4s ease-in-out infinite;animation-delay:${delay}s"/>`;
    }).join("");

    return `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--blue-glow)"/><stop offset="100%" stop-color="var(--violet-glow)"/></linearGradient></defs>${lines}${nodes}</svg>`;
  }, []);

  useEffect(() => {
    if (dagRef.current) {
      dagRef.current.innerHTML = dagSvg;
    }
  }, [dagSvg]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    const glowEl = glowRef.current;
    if (!sectionEl || !glowEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const applyGlow = () => {
      rafId = null;
      glowEl.style.transform = `translate(${lastX - GLOW_SIZE / 2}px, ${lastY - GLOW_SIZE / 2}px)`;
    };

    const handleMove = (event: PointerEvent) => {
      const rect = sectionEl.getBoundingClientRect();
      lastX = event.clientX - rect.left;
      lastY = event.clientY - rect.top;
      glowEl.style.opacity = "1";
      if (rafId === null) {
        rafId = requestAnimationFrame(applyGlow);
      }
    };

    const handleLeave = () => {
      glowEl.style.opacity = "0";
    };

    sectionEl.addEventListener("pointermove", handleMove);
    sectionEl.addEventListener("pointerleave", handleLeave);
    return () => {
      sectionEl.removeEventListener("pointermove", handleMove);
      sectionEl.removeEventListener("pointerleave", handleLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const leftEl = headLeftRef.current;
    const rightEl = headRightRef.current;
    const wrapEl = photoWrapRef.current;
    if (!leftEl || !wrapEl || !headSrc || !bodySrc) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const HYSTERESIS = 0.08;
    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let facingRight = false;

    const applyTilt = () => {
      rafId = null;
      const rect = wrapEl.getBoundingClientRect();
      const pivotX = rect.left + rect.width / 2;
      const pivotY = rect.top + rect.height * 0.42;
      const range = 700;
      const nx = Math.max(-1, Math.min(1, (lastX - pivotX) / range));
      const ny = Math.max(-1, Math.min(1, (lastY - pivotY) / range));

      if (rightEl) {
        if (!facingRight && nx > HYSTERESIS) facingRight = true;
        else if (facingRight && nx < -HYSTERESIS) facingRight = false;
        // headSrc (leftEl) gazes toward screen-right in the source photo;
        // headRightSrc (rightEl) is its mirror and gazes toward screen-left.
        leftEl.style.opacity = facingRight ? "1" : "0";
        rightEl.style.opacity = facingRight ? "0" : "1";
      }

      const rotateY = nx * (rightEl ? 10 : 16);
      const rotateX = ny * -11;
      const translateX = nx * 7;
      const translateY = ny * 4;
      const transform = `translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      leftEl.style.transform = transform;
      if (rightEl) rightEl.style.transform = transform;
    };

    const handlePointerMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(applyTilt);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [headSrc, headRightSrc, bodySrc]);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-36 h-[520px] w-[520px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-[#0b4295] opacity-55 blur-[90px] [data-theme=light]:opacity-35"></div>
        <div className="absolute -bottom-44 -right-24 h-[460px] w-[460px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-[#6d3495] opacity-55 blur-[90px] [animation-delay:-6s] [data-theme=light]:opacity-35"></div>
        <div className="absolute left-[55%] top-[40%] h-[300px] w-[300px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-violet-glow opacity-25 blur-[90px] [animation-delay:-11s]"></div>
        <div className="absolute inset-0 opacity-55 [data-theme=light]:opacity-30" ref={dagRef}></div>
        <div
          ref={glowRef}
          className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full opacity-0 transition-opacity duration-300 [background:radial-gradient(circle,rgba(139,92,246,0.35)_0%,rgba(62,123,250,0.16)_45%,transparent_72%)] [will-change:transform]"
        ></div>
      </div>

      <div className="container-shell relative z-10">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_.85fr] md:gap-6">
          <div className="order-2 md:order-1">
            <div className="eyebrow">
              {hero.eyebrow}
              <span
                className="inline-block h-[0.9em] w-[0.5ch] translate-y-[0.05em] bg-violet-glow [animation:cursor-blink_1s_steps(1)_infinite]"
                aria-hidden="true"
              ></span>
            </div>
            <div className="opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.25s]">
              <h1 className="gradient-text mb-2 [font-family:var(--font-display)] text-[clamp(2.4rem,8vw,5rem)] font-bold leading-none pb-[0.22em] tracking-[0.02em]">{wordmarkAlt}</h1>
            </div>
            <p className="mb-4 [font-family:var(--font-heading)] text-[clamp(1.1rem,2.4vw,1.5rem)] font-semibold text-text-main opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.55s]">{hero.role}</p>
            <p className="mb-8 max-w-[54ch] text-[clamp(1rem,1.6vw,1.15rem)] text-text-muted opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.7s]">{hero.description}</p>
            <div className="flex flex-wrap gap-3 opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.85s]">
              {hero.ctas.map((cta) => (
                <a
                  key={cta.href}
                  href={cta.href}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3 [font-family:var(--font-heading)] text-[.95rem] font-semibold transition hover:-translate-y-0.5 ${
                    cta.style === "primary"
                      ? "bg-gradient-to-r from-blue-glow to-violet-glow text-white shadow-[0_10px_30px_-8px_rgba(139,92,246,.55)]"
                      : "border border-border-strong text-text-main hover:border-violet-glow hover:bg-[var(--grad-soft)]"
                  }`}
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>

          {headSrc && bodySrc ? (
            <div
              ref={photoWrapRef}
              role="img"
              aria-label={hero.photoAlt || ""}
              className="relative order-1 mx-auto w-[220px] self-center [perspective:900px] sm:w-[260px] md:order-2 md:w-full md:-mb-28 md:self-end md:justify-self-end"
            >
              <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-br from-blue-glow to-violet-glow opacity-40 blur-[70px]"></div>
              <img
                src={bodySrc}
                alt=""
                aria-hidden="true"
                className="relative mx-auto w-full max-w-[320px] object-contain opacity-0 [filter:drop-shadow(0_30px_50px_rgba(10,6,25,0.55))] animate-[rise-in_.9s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.4s] md:max-w-[380px]"
              />
              <img
                ref={headLeftRef}
                src={headSrc}
                alt=""
                aria-hidden="true"
                onAnimationEnd={(event) => {
                  const el = event.currentTarget;
                  el.style.animation = "none";
                  el.style.opacity = "1";
                }}
                className="absolute inset-0 mx-auto w-full max-w-[320px] object-contain opacity-0 [filter:drop-shadow(0_30px_50px_rgba(10,6,25,0.55))] [transform-origin:50%_46%] [will-change:transform] transition-opacity duration-150 animate-[rise-in_.9s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.4s] md:max-w-[380px]"
              />
              {headRightSrc ? (
                <img
                  ref={headRightRef}
                  src={headRightSrc}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 mx-auto w-full max-w-[320px] object-contain opacity-0 [filter:drop-shadow(0_30px_50px_rgba(10,6,25,0.55))] [transform-origin:50%_46%] [will-change:transform] transition-opacity duration-150 md:max-w-[380px]"
                />
              ) : null}
            </div>
          ) : photoSrc ? (
            <div className="relative order-1 mx-auto w-[220px] self-center sm:w-[260px] md:order-2 md:w-full md:-mb-28 md:self-end md:justify-self-end">
              <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-br from-blue-glow to-violet-glow opacity-40 blur-[70px]"></div>
              <img
                src={photoSrc}
                alt={hero.photoAlt || ""}
                className="relative mx-auto w-full max-w-[320px] object-contain opacity-0 [filter:drop-shadow(0_30px_50px_rgba(10,6,25,0.55))] animate-[rise-in_.9s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.4s] md:max-w-[380px]"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:1.1s]">
        <span className="[font-family:var(--font-mono)] text-xs text-text-faint">{scrollHint}</span>
        <span className="h-8 w-px animate-[scrollline_1.8s_ease-in-out_infinite] bg-gradient-to-b from-text-faint to-transparent"></span>
      </div>
    </section>
  );
}
