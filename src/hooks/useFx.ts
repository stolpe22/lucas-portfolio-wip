import { useRef } from "react";
import { gsap, MOTION_OK, SplitText, unclipMasks, useGSAP } from "../lib/gsap";

/**
 * Heading that rises word by word (masked) when it scrolls into view.
 * `key` re-runs the split when the text changes (language switch).
 */
export function useSplitReveal<T extends HTMLElement>(key: string) {
  const ref = useRef<T | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, {
          type: "words",
          mask: "words",
          autoSplit: true,
          onSplit: (self) => {
            unclipMasks(self);
            return gsap.from(self.words, {
              yPercent: 110,
              duration: 0.9,
              ease: "power4.out",
              stagger: 0.05,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [key], revertOnUpdate: true },
  );
  return ref;
}

/**
 * Counts every number inside the element's text up from 0 when it scrolls into view
 * ("10 anos" → 0…10 anos, "2a 5m" → both numbers). Without motion it just shows the text.
 */
export function useCountUp<T extends HTMLElement>(text: string) {
  const ref = useRef<T | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !/\d/.test(text)) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const state = { p: 0 };
        const render = () => {
          el.textContent = text.replace(/\d+/g, (n) => String(Math.round(Number(n) * state.p)));
        };
        gsap.fromTo(
          state,
          { p: 0 },
          {
            p: 1,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: render,
            onStart: render,
            immediateRender: true,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
        render();
        return () => {
          el.textContent = text;
        };
      });
      return () => mm.revert();
    },
    { dependencies: [text], revertOnUpdate: true },
  );
  return ref;
}

/** Thin reading-progress bar at the top of the page. */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
    );
  });
  return ref;
}

/**
 * Cascade: children matching `selector` rise in one after another when the container scrolls
 * into view (once). `key` re-runs it when the content changes (language switch).
 */
export function useCascade<T extends HTMLElement>(selector: string, key: string, opts: { y?: number; stagger?: number; x?: number } = {}) {
  const ref = useRef<T | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(el.querySelectorAll(selector), {
          y: opts.y ?? 24,
          x: opts.x ?? 0,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: opts.stagger ?? 0.06,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [key], revertOnUpdate: true },
  );
  return ref;
}
