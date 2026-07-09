import { useEffect, useMemo, useRef } from "react";
import type { SiteContent } from "../../types/content";

interface HeroProps {
  hero: SiteContent["hero"];
  wordmarkAlt: string;
  scrollHint: string;
}

const DAG_NODES: Array<[number, number]> = [
  [120, 140], [340, 90], [560, 200], [180, 380], [420, 340],
  [700, 120], [860, 320], [980, 160], [760, 420], [1060, 420],
  [260, 560], [520, 540], [900, 560],
];

const DAG_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [4, 5], [5, 6], [2, 6],
  [6, 7], [6, 8], [8, 9], [3, 10], [10, 11], [4, 11], [8, 12],
];

export function Hero({ hero, wordmarkAlt, scrollHint }: HeroProps) {
  const dagRef = useRef<HTMLDivElement | null>(null);
  const photoSrc = hero.photo?.startsWith("/")
    ? `${import.meta.env.BASE_URL}${hero.photo.slice(1)}`
    : hero.photo;

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

  return (
    <section className="relative isolate overflow-hidden pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-36 h-[520px] w-[520px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-[#0b4295] opacity-55 blur-[90px] [data-theme=light]:opacity-35"></div>
        <div className="absolute -bottom-44 -right-24 h-[460px] w-[460px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-[#6d3495] opacity-55 blur-[90px] [animation-delay:-6s] [data-theme=light]:opacity-35"></div>
        <div className="absolute left-[55%] top-[40%] h-[300px] w-[300px] animate-[drift_18s_ease-in-out_infinite_alternate] rounded-full bg-violet-glow opacity-25 blur-[90px] [animation-delay:-11s]"></div>
        <div className="absolute inset-0 opacity-55 [data-theme=light]:opacity-30" ref={dagRef}></div>
      </div>

      <div className="container-shell relative z-10">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_.85fr] md:gap-6">
          <div className="order-2 md:order-1">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h1 className="gradient-text mb-2 [font-family:var(--font-display)] text-[clamp(2.4rem,8vw,5rem)] font-bold leading-none tracking-[0.02em] opacity-0 animate-[rise-in_.8s_cubic-bezier(.22,.68,.35,1)_forwards] [animation-delay:.25s]">{wordmarkAlt}</h1>
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

          {photoSrc ? (
            <div className="relative order-1 mx-auto w-[220px] sm:w-[260px] md:order-2 md:w-full md:justify-self-end">
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
