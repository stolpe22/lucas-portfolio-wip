import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, MOTION_OK } from "../../lib/gsap";
import { TechTile } from "./TechTile";
import { TECHS } from "./techs";

interface LogoTrailProps {
  /** Label on the tape across the band. */
  hint: string;
  /** Small "how to play" line under the tape, for mouse and for touch. */
  mouseHint: string;
  touchHint: string;
}

/** Distance (px) the pointer must travel before the next logo drops. */
const GAP = 90;

/**
 * "Wiggle your mouse": a band where moving the pointer drops technology logos that pop in
 * (elastic), spin and fall off the screen — adapted from the GSAP image-trail demo.
 * The falling tiles live in a body-level fixed layer (a portal), so smooth-scroll transforms
 * don't affect them. Works with touch drags too. Reduced motion: the band shows all tiles at rest.
 */
export function LogoTrail({ hint, mouseHint, touchHint }: LogoTrailProps) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useMemo(() => !window.matchMedia(MOTION_OK).matches, []);
  const coarse = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  // Two of each so fast wiggles never run out of tiles.
  const pool = useMemo(() => [...TECHS, ...TECHS], []);

  useEffect(() => {
    if (reduced) return;
    const band = bandRef.current;
    const layer = layerRef.current;
    if (!band || !layer) return;
    const tiles = Array.from(layer.children) as HTMLElement[];
    let index = 0;
    let mouse = { x: 0, y: 0 };
    let last = { x: 0, y: 0 };
    let inside = false;

    const drop = () => {
      const tile = tiles[index % tiles.length];
      index++;
      gsap.killTweensOf(tile);
      gsap.set(tile, { clearProps: "all" });
      gsap.set(tile, { opacity: 1, left: mouse.x, top: mouse.y, xPercent: -50, yPercent: -50 });
      gsap
        .timeline()
        .from(tile, { opacity: 0, scale: 0, duration: 1, ease: "elastic.out(1, 0.3)" })
        .to(tile, { rotation: "random(-360, 360)", duration: 1 }, "<")
        .to(tile, { y: "120vh", ease: "back.in(0.4)", duration: 1 }, 0);
    };

    const onMove = (e: PointerEvent) => {
      const r = band.getBoundingClientRect();
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      mouse = { x: e.clientX, y: e.clientY };
      if (!inside) last = mouse;
    };

    const tick = () => {
      if (!inside) return;
      if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > GAP) {
        drop();
        last = mouse;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(tick);
      tiles.forEach((t) => gsap.killTweensOf(t));
    };
  }, [reduced]);

  return (
    <>
      <div
        ref={bandRef}
        className={`relative flex min-h-[46vh] items-center justify-center overflow-hidden border-y-[1.5px] border-text-main bg-surface-2 ${coarse ? "touch-none" : ""}`}
      >
        <div className="dot-grid opacity-60" aria-hidden="true"></div>
        {reduced ? (
          <div className="relative flex flex-wrap justify-center gap-4 p-8">
            {TECHS.map((t) => (
              <TechTile key={t.name} tech={t} />
            ))}
          </div>
        ) : (
          <div className="pointer-events-none relative flex select-none flex-col items-center gap-3" aria-hidden="true">
            <span className="-rotate-2 border-[1.5px] border-text-main bg-text-main px-5 py-2 [font-family:var(--font-mono)] text-[clamp(.85rem,1.6vw,1.05rem)] tracking-[0.04em] text-bg shadow-[4px_4px_0_var(--accent)]">
              {hint}
            </span>
            <span className="[font-family:var(--font-mono)] text-[.75rem] text-text-faint">{coarse ? touchHint : mouseHint}</span>
          </div>
        )}
      </div>

      {/* Falling tiles: fixed, above everything, never catching the pointer. */}
      {!reduced
        ? createPortal(
            <div ref={layerRef} className="pointer-events-none fixed inset-0 z-[150] overflow-hidden" aria-hidden="true">
              {pool.map((t, i) => (
                <div key={`${t.name}-${i}`} className="fixed left-0 top-0 opacity-0">
                  <TechTile tech={t} />
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
