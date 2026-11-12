import { useEffect } from "react";

/**
 * Pointer-driven light (frame layer only, never on top of data):
 * - sets --mx/--my on <html> (viewport px) for the page-wide glow and the hero dot grid;
 * - sets --sx/--sy on the hovered `.spotlight` element (local px) for its hover light;
 * - sets --hx/--hy on the hovered `[data-light-area]` element (local px) for the lit dot grid.
 * Only on fine pointers (mouse/trackpad) and when the user allows motion.
 */
export function usePointerLight() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const root = document.documentElement;
    let rafId: number | null = null;
    let x = 0;
    let y = 0;
    let target: HTMLElement | null = null;
    let area: HTMLElement | null = null;

    const apply = () => {
      rafId = null;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
      if (target) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--sx", `${x - rect.left}px`);
        target.style.setProperty("--sy", `${y - rect.top}px`);
      }
      if (area) {
        const rect = area.getBoundingClientRect();
        area.style.setProperty("--hx", `${x - rect.left}px`);
        area.style.setProperty("--hy", `${y - rect.top}px`);
      }
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      const el = event.target as Element | null;
      target = el?.closest<HTMLElement>(".spotlight") ?? null;
      area = el?.closest<HTMLElement>("[data-light-area]") ?? null;
      root.dataset.pointer = "on";
      if (rafId === null) rafId = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      root.dataset.pointer = "off";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
      delete root.dataset.pointer;
    };
  }, []);
}
