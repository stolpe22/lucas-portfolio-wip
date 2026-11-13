import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExperienceItem, Milestone, SiteContent } from "../../types/content";
import { formatDuration } from "../../lib/format";

interface MilestonesProps {
  data: SiteContent["milestones"];
  experience: ExperienceItem[];
  ui: SiteContent["ui"]["milestones"];
  dates: SiteContent["ui"]["dates"];
  onClose: () => void;
  /** The next tour screen (the overlay sits between two screens, so it also moves the tour forward). */
  next?: { eyebrow: string; label: string; onGo: () => void };
}

const TOUR_MS = 3800;
/** Distance between the line and the cards (stem length). */
const STEM = 34;

/** Month index; a year-only date sits at December (unknown month, shown as the year only). */
function idx(date: string): number {
  const [year, month] = date.split("-").map(Number);
  return year * 12 + ((month || 12) - 1);
}

function nowIdx() {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
}

/** Every job active in that month (parallel jobs included), oldest first. */
function rolesAt(month: number, experience: ExperienceItem[]) {
  return experience
    .filter((item) => idx(item.start) <= month && month <= (item.end ? idx(item.end) : nowIdx()))
    .sort((a, b) => idx(a.start) - idx(b.start));
}

function rolesLabel(month: number, experience: ExperienceItem[]) {
  const roles = rolesAt(month, experience);
  return roles.length ? roles.map((r) => `${r.role} · ${r.company}`).join(" + ") : "—";
}

/** Node shape per kind: career = filled dot, education = ring, event = diamond. */
function nodeShape(kind: Milestone["kind"]) {
  if (kind === "education") return "rounded-full border-2 border-accent bg-bg";
  if (kind === "event") return "rotate-45 rounded-[2px] border-2 border-accent bg-accent";
  return "rounded-full border-2 border-accent bg-accent";
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export function Milestones({ data, experience, ui, dates, onClose, next }: MilestonesProps) {
  const items = data.items;
  const reducedMotion = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [active, setActive] = useState<number | null>(null);
  const [touring, setTouring] = useState(false);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const fx = useMemo(
    () => window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const vw = useViewportWidth();
  const phone = vw < 640;
  const step = phone ? 220 : 300; // even spacing; the real time is written on each segment
  const cardW = phone ? 190 : 250;
  const activeW = phone ? 210 : 330;
  const pad = Math.max(cardW, vw / 2); // lets the first and last milestones reach the center
  const trackW = pad * 2 + (items.length - 1) * step;
  const xOf = useCallback((i: number) => pad + i * step, [pad, step]);

  const dateLabel = (d: string) => {
    const [y, mo] = d.split("-");
    return mo ? `${dates.months[Number(mo) - 1]}/${y}` : y;
  };
  const isApprox = (a: Milestone, b: Milestone) => a.date.length === 4 || b.date.length === 4;
  const gap = (a: Milestone, b: Milestone) => formatDuration(idx(b.date) - idx(a.date), dates);
  const gapShort = (a: Milestone, b: Milestone) => {
    const total = idx(b.date) - idx(a.date);
    const y = Math.floor(total / 12);
    const mo = total % 12;
    const ys = dates.year === "ano" ? "a" : "y";
    return [y ? `${y}${ys}` : "", mo ? `${mo}m` : ""].filter(Boolean).join(" ");
  };

  const clamp = useCallback((n: number) => Math.max(0, Math.min(items.length - 1, n)), [items.length]);

  // Center the emphasized milestone sideways, then make sure its card is fully visible vertically.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || active === null) return;
    const behavior = reducedMotion ? "auto" : "smooth";
    scroller.scrollTo({ left: xOf(active) - scroller.clientWidth / 2, behavior });
    const t = window.setTimeout(() => {
      document.getElementById(`ms-card-${active}`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior });
    }, 380);
    return () => window.clearTimeout(t);
  }, [active, xOf, reducedMotion]);

  // Guided tour: emphasizes each milestone in turn and stops at the last one.
  useEffect(() => {
    if (!touring) return;
    const t = window.setTimeout(
      () => {
        const next = clamp(active === null ? 0 : active + 1);
        setActive(next);
        if (next >= items.length - 1) setTouring(false);
      },
      active === null ? 200 : TOUR_MS,
    );
    return () => window.clearTimeout(t);
  }, [touring, active, items.length, clamp]);

  const select = useCallback((i: number | null) => {
    setTouring(false);
    setActive(i);
  }, []);
  const stepBy = useCallback(
    (delta: number) => {
      setTouring(false);
      setActive((a) => clamp(a === null ? (delta > 0 ? 0 : items.length - 1) : a + delta));
    },
    [clamp, items.length],
  );

  // Keyboard: ← → move the emphasis, Home/End; Esc closes the detail first, then the view.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) event.preventDefault();
      if (event.key === "Escape") {
        if (active !== null) select(null);
        else onClose();
      } else if (event.key === "ArrowRight") stepBy(1);
      else if (event.key === "ArrowLeft") stepBy(-1);
      else if (event.key === "Home") select(0);
      else if (event.key === "End") select(items.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, items.length, onClose, select, stepBy]);

  // Vertical mouse wheel scrolls the line sideways.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      scroller.scrollLeft += event.deltaY;
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, []);

  // Focus and lock the page behind.
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Start with the beginning of the line in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = Math.max(0, xOf(0) - (phone ? 120 : 260));
    // Only on first layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const watermark = active !== null ? items[active].date.slice(0, 4) : null;

  // Pointer "lens" on the line: nodes swell as the cursor gets close (dock-style magnification),
  // and a readout runs along the line with the date under the cursor (interpolated between milestones).
  const onTrackMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!fx || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const nearLine = Math.abs(event.clientY - (rect.top + rect.height / 2)) < 150;
    const overCard = (event.target as Element).closest("[data-card]");

    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      const d = Math.abs(x - xOf(i));
      const s = nearLine ? 1 + 0.9 * Math.max(0, 1 - d / 170) : 1;
      node.style.setProperty("--lens", s.toFixed(3));
    });

    const readout = readoutRef.current;
    if (!readout) return;
    const first = xOf(0);
    const last = xOf(items.length - 1);
    if (!nearLine || overCard || x < first || x > last) {
      readout.style.opacity = "0";
      return;
    }
    const seg = Math.min(items.length - 2, Math.floor((x - first) / step));
    const t = (x - xOf(seg)) / step;
    const month = Math.round(idx(items[seg].date) + t * (idx(items[seg + 1].date) - idx(items[seg].date)));
    const label = `${dates.months[month % 12]}/${Math.floor(month / 12)}`;
    readout.style.opacity = "1";
    readout.style.transform = `translateX(${x}px)`;
    const text = readout.querySelector("[data-text]");
    if (text) text.textContent = label;
  };
  const onTrackLeave = () => {
    nodeRefs.current.forEach((node) => node?.style.setProperty("--lens", "1"));
    if (readoutRef.current) readoutRef.current.style.opacity = "0";
  };

  // Cards tilt toward the cursor (3D), with a light that follows it (.spotlight).
  const onCardMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!fx) return;
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (event.clientX - r.left) / r.width - 0.5;
    const py = (event.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) translateZ(0)`;
  };
  const onCardLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.transform = "";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ui.eyebrow}
      data-light-area
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto overscroll-contain bg-bg animate-[overlay-in_.35s_ease-out] print:hidden"
    >
      {/* Frame decoration, behind everything. */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="dot-grid opacity-70"></div>
        <div className="dot-grid-lit"></div>
        {fx ? (
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 [:root[data-pointer=on]_&]:opacity-100"
            style={{ background: "radial-gradient(380px circle at var(--hx, -999px) var(--hy, -999px), var(--accent-soft), transparent 70%)" }}
          ></div>
        ) : null}
        <div
          className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px]"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
        ></div>
        {watermark ? (
          <div
            key={watermark}
            className="absolute -right-[3vw] bottom-[2vh] select-none [font-family:var(--font-display)] text-[40vw] font-semibold leading-none text-text-main/[0.035] animate-[year-in_.9s_ease-out] md:text-[22vw]"
          >
            {watermark}
          </div>
        ) : null}
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg/85 backdrop-blur">
        <div className="container-shell flex items-center justify-between gap-3 py-3">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm min-h-11"
        >
          <span aria-hidden="true">←</span> {ui.back}
        </button>
        <span className="label-mono hidden sm:inline">{ui.eyebrow}</span>
        <span className="[font-family:var(--font-mono)] text-[.85rem] text-text-muted" aria-live="polite">
          {active !== null ? (
            <>
              <span className="text-text-main">{String(active + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}
            </>
          ) : (
            String(items.length).padStart(2, "0")
          )}
        </span>
        </div>
      </header>

      <div className="container-shell relative pt-5">
        <h2 className="[font-family:var(--font-heading)] text-[clamp(1.25rem,3.4vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em]">
          {data.heading}
        </h2>
        <p className="mt-1.5 hidden text-[.95rem] text-text-muted sm:block">{data.subheading}</p>
        <p className="mt-1 [font-family:var(--font-mono)] text-[.75rem] text-text-faint sm:hidden">{ui.swipeHint} →</p>
      </div>

      {/* The line: centered vertically, runs sideways; cards alternate above and below. */}
      <div className="relative min-h-[420px] flex-1 sm:min-h-[680px]">
        <div
          ref={scrollerRef}
          className="absolute inset-0 overflow-x-auto overflow-y-hidden [scrollbar-width:thin]"
          onClick={(event) => {
            if (event.target === event.currentTarget) select(null);
          }}
        >
          <div
            ref={trackRef}
            className="relative h-full"
            style={{ width: trackW }}
            onPointerMove={onTrackMove}
            onPointerLeave={onTrackLeave}
            onClick={(event) => {
              if (event.target === event.currentTarget) select(null);
            }}
          >
            {/* Date readout that runs along the line with the cursor. */}
            {fx ? (
              <div
                ref={readoutRef}
                className="pointer-events-none absolute left-0 top-1/2 z-20 opacity-0 transition-opacity duration-150"
                aria-hidden="true"
              >
                <span className="absolute left-0 top-0 h-10 w-px -translate-y-1/2 bg-accent/70"></span>
                <span
                  data-text
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-[38px] whitespace-nowrap bg-text-main px-2 py-0.5 [font-family:var(--font-mono)] text-[.66rem] text-bg"
                ></span>
              </div>
            ) : null}
            {/* Base line draws in from the left. */}
            <div
              className="absolute top-1/2 h-[2px] origin-left -translate-y-1/2 bg-text-main/50"
              style={{
                left: xOf(0),
                width: xOf(items.length - 1) - xOf(0),
                animation: reducedMotion ? undefined : "draw-x 1.2s cubic-bezier(.22,.68,.35,1) both",
              }}
            ></div>
            {/* Accent fill up to the emphasized milestone. */}
            <div
              className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-accent transition-[width] duration-700 ease-out"
              style={{ left: xOf(0), width: active !== null ? xOf(active) - xOf(0) : 0 }}
            ></div>

            {/* Real time between milestones, written on the line (spacing is even, not to scale). */}
            {items.slice(1).map((m, i) => (
              <span
                key={`gap-${m.date}-${m.title}`}
                className="absolute top-1/2 whitespace-nowrap bg-bg px-2 [font-family:var(--font-mono)] text-[.66rem] text-text-faint"
                style={{
                  left: (xOf(i) + xOf(i + 1)) / 2,
                  transform: "translate(-50%, -50%)",
                  animation: reducedMotion ? undefined : "card-in .5s ease-out both",
                  animationDelay: reducedMotion ? undefined : `${700 + i * 70}ms`,
                }}
              >
                {isApprox(items[i], m) ? "≈ " : ""}
                {phone ? gapShort(items[i], m) : gap(items[i], m)}
              </span>
            ))}

            {items.map((m, i) => {
              const above = i % 2 === 0;
              const isActive = active === i;
              const dimmed = active !== null && !isActive;
              const prev = i > 0 ? items[i - 1] : null;
              const x = xOf(i);
              const enterDelay = reducedMotion ? undefined : `${450 + i * 90}ms`;

              return (
                <div key={`${m.date}-${m.title}`}>
                  {/* Node */}
                  <button
                    type="button"
                    onClick={() => select(isActive ? null : i)}
                    aria-label={`${dateLabel(m.date)}: ${m.title}`}
                    aria-pressed={isActive}
                    className="group absolute top-1/2 z-10 flex h-10 w-10 items-center justify-center"
                    style={{
                      left: x,
                      transform: "translate(-50%, -50%)",
                      animation: reducedMotion ? undefined : "pop-in .5s cubic-bezier(.34,1.56,.64,1) both",
                      animationDelay: enterDelay,
                    }}
                  >
                    {isActive ? (
                      <span
                        className="absolute left-1/2 top-1/2 h-5 w-5 rounded-full bg-accent/40"
                        style={{ animation: reducedMotion ? undefined : "ring-pulse 1.6s ease-out infinite" }}
                        aria-hidden="true"
                      ></span>
                    ) : null}
                    <span
                      ref={(el) => {
                        nodeRefs.current[i] = el;
                      }}
                      className={`relative block transition-[transform,scale] duration-200 ease-out group-hover:scale-125 ${nodeShape(m.kind)} ${
                        isActive ? "h-[18px] w-[18px]" : "h-3.5 w-3.5"
                      }`}
                      style={{ transform: "scale(var(--lens, 1))" }}
                    ></span>
                  </button>

                  {/* Year on the opposite side of the card. */}
                  <span
                    className={`absolute -translate-x-1/2 [font-family:var(--font-mono)] text-[.72rem] transition-colors ${
                      isActive ? "text-accent" : "text-text-faint"
                    }`}
                    style={{ left: x, ...(above ? { top: "calc(50% + 16px)" } : { bottom: "calc(50% + 16px)" }) }}
                    aria-hidden="true"
                  >
                    {m.date.slice(0, 4)}
                  </span>

                  {/* Stem */}
                  <span
                    className={`absolute w-px transition-colors ${isActive ? "bg-accent" : "bg-border-strong"}`}
                    style={{
                      left: x,
                      height: STEM - 8,
                      ...(above ? { bottom: "calc(50% + 8px)" } : { top: "calc(50% + 8px)" }),
                    }}
                    aria-hidden="true"
                  ></span>

                  {/* Card: grows away from the line when emphasized. */}
                  <div
                    id={`ms-card-${i}`}
                    className="absolute scroll-mb-28 scroll-mt-6"
                    style={{
                      left: x,
                      width: isActive ? activeW : cardW,
                      transform: "translateX(-50%)",
                      transition: "width .35s cubic-bezier(.22,.68,.35,1)",
                      zIndex: isActive ? 5 : 1,
                      ...(above ? { bottom: `calc(50% + ${STEM}px)` } : { top: `calc(50% + ${STEM}px)` }),
                    }}
                  >
                    <div
                      data-card
                      className="transition-transform duration-200 ease-out [transform-style:preserve-3d]"
                      onPointerMove={onCardMove}
                      onPointerLeave={onCardLeave}
                    >
                    <button
                      type="button"
                      onClick={() => select(isActive ? null : i)}
                      aria-expanded={isActive}
                      className={`spotlight w-full border-[1.5px] bg-surface p-3.5 text-left transition-[opacity,border-color,box-shadow,transform] duration-300 ${
                        isActive
                          ? "border-text-main shadow-[6px_6px_0_var(--accent)]"
                          : "border-text-main shadow-[3px_3px_0_var(--text)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--text)]"
                      } ${dimmed ? "opacity-55 hover:opacity-100" : ""}`}
                      style={{
                        animation: reducedMotion ? undefined : "card-in .55s cubic-bezier(.22,.68,.35,1) both",
                        animationDelay: enterDelay,
                      }}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 [font-family:var(--font-mono)] text-[.66rem] uppercase tracking-[0.08em] text-accent">
                          <span className={`inline-block h-2 w-2 ${nodeShape(m.kind)}`}></span>
                          {ui.kinds[m.kind]}
                        </span>
                        <span className="[font-family:var(--font-mono)] text-[.7rem] text-text-faint">{dateLabel(m.date)}</span>
                      </span>
                      <span className={`mt-2 block font-semibold leading-snug text-text-main ${isActive ? "text-[1.05rem]" : "text-[.9rem]"}`}>
                        {m.title}
                      </span>

                      {isActive && !phone ? (
                        <span className="block animate-[card-in_.4s_ease-out]">
                          <span className="mt-2 block text-[.86rem] leading-relaxed text-text-muted">{m.description}</span>
                          <span className="mt-3 grid gap-2 border-t border-border-subtle pt-3 text-[.78rem]">
                            <span>
                              <span className="label-mono block !text-[.62rem]">{ui.roleAtTime}</span>
                              <span className="text-text-main">{rolesLabel(idx(m.date), experience)}</span>
                            </span>
                            <span>
                              <span className="label-mono block !text-[.62rem]">{prev ? ui.sinceLast : ui.firstOne}</span>
                              <span className="[font-family:var(--font-mono)] text-accent">
                                {prev
                                  ? `${isApprox(prev, m) ? "≈ " : "+"}${gap(prev, m)}`
                                  : `+${formatDuration(nowIdx() - idx(m.date), dates)}`}
                              </span>
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edge fades hint that the line continues sideways. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg to-transparent sm:w-20" aria-hidden="true"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent sm:w-20" aria-hidden="true"></div>
      </div>

      {/* Controls (+ details sheet on phones) */}
      <div className="sticky bottom-0 z-10 border-t border-border-subtle bg-bg/90 py-3 backdrop-blur">
        {phone && active !== null ? (
          <div
            key={`sheet-${active}`}
            className="container-shell mb-3 max-h-[45vh] overflow-y-auto animate-[card-in_.35s_ease-out]"
            aria-live="polite"
          >
            <div className="border-[1.5px] border-text-main bg-surface p-4 shadow-[4px_4px_0_var(--accent)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 [font-family:var(--font-mono)] text-[.66rem] uppercase tracking-[0.08em] text-accent">
                    <span className={`inline-block h-2 w-2 ${nodeShape(items[active].kind)}`}></span>
                    {ui.kinds[items[active].kind]} · {dateLabel(items[active].date)}
                  </div>
                  <div className="mt-1.5 font-semibold leading-snug text-text-main">{items[active].title}</div>
                </div>
                <button
                  type="button"
                  onClick={() => select(null)}
                  aria-label={ui.back}
                  className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center text-text-faint hover:bg-text-main hover:text-bg"
                >
                  ×
                </button>
              </div>
              <p className="mt-2 text-[.9rem] leading-relaxed text-text-muted">{items[active].description}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3 text-[.78rem]">
                <div>
                  <div className="label-mono !text-[.6rem]">{ui.roleAtTime}</div>
                  <div className="text-text-main">
                    {rolesLabel(idx(items[active].date), experience)}
                  </div>
                </div>
                <div>
                  <div className="label-mono !text-[.6rem]">{active > 0 ? ui.sinceLast : ui.firstOne}</div>
                  <div className="[font-family:var(--font-mono)] text-accent">
                    {active > 0
                      ? `${isApprox(items[active - 1], items[active]) ? "≈ " : "+"}${gap(items[active - 1], items[active])}`
                      : `+${formatDuration(nowIdx() - idx(items[active].date), dates)}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="container-shell flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stepBy(-1)}
              disabled={active === 0}
              aria-label={ui.previous}
              className="btn btn-ghost btn-icon disabled:pointer-events-none disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                if (touring) {
                  setTouring(false);
                  return;
                }
                if (active === items.length - 1) setActive(null);
                setTouring(true);
              }}
              aria-label={touring ? ui.pause : active === items.length - 1 ? ui.replay : ui.play}
              className="btn btn-ink relative overflow-hidden"
            >
              <span aria-hidden="true">{touring ? "❚❚" : active === items.length - 1 ? "↺" : "▶"}</span>
              <span className={next ? "hidden sm:inline" : ""}>{touring ? ui.pause : active === items.length - 1 ? ui.replay : ui.play}</span>
              {touring && active !== null ? (
                <span
                  key={`p-${active}`}
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent"
                  style={{ animation: `fill-x ${TOUR_MS}ms linear both` }}
                  aria-hidden="true"
                ></span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => stepBy(1)}
              disabled={active === items.length - 1}
              aria-label={ui.next}
              className="btn btn-ghost btn-icon disabled:pointer-events-none disabled:opacity-30"
            >
              →
            </button>
          </div>
          <span className="hidden flex-1 text-center [font-family:var(--font-mono)] text-[.75rem] text-text-faint xl:inline">{ui.hint}</span>
          {next ? (
            <button type="button" onClick={next.onGo} aria-label={`${next.eyebrow}: ${next.label}`} className="group flex shrink-0 items-center gap-3 text-left">
              <span className="hidden flex-col sm:flex">
                <span className="label-mono !text-[.62rem]">{next.eyebrow}</span>
                <span className="[font-family:var(--font-display)] text-[clamp(1.25rem,2.6vw,1.9rem)] font-extrabold leading-none tracking-[-0.02em] transition-colors group-hover:text-accent">
                  {next.label}
                </span>
              </span>
              <span
                className="flex h-11 items-center justify-center gap-2 border-[1.5px] border-text-main bg-accent px-3 text-[1.2rem] text-on-accent shadow-[3px_3px_0_var(--text)] transition-transform group-hover:translate-x-1 sm:w-11 sm:px-0"
                aria-hidden="true"
              >
                <span className="text-[.9rem] font-semibold sm:hidden">{next.label}</span>→
              </span>
            </button>
          ) : (
            <span className="hidden text-right [font-family:var(--font-mono)] text-[.75rem] text-text-faint md:inline">{ui.hint}</span>
          )}
        </div>
      </div>
    </div>
  );
}
