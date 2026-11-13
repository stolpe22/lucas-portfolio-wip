import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, MOTION_OK, ScrollSmoother, ScrollTrigger, SplitText, unclipMasks } from "../lib/gsap";

/** Screens that are overlays handled elsewhere (not routed views). */
const OVERLAYS = new Set(["marcos"]);

interface Options {
  /** Screen ids in tour order (nav hrefs without "#"). */
  ids: string[];
  /** Label shown on the curtain for a screen id (null = home). */
  labelFor: (id: string | null) => string;
  /** Called for overlay screens (e.g. "marcos"). */
  onOverlay: (id: string) => void;
}

/**
 * Tour router: one screen at a time, chosen by the URL hash (#stack, #experiencia…; no hash = home).
 * Changing screen runs a curtain wipe (accent panel with the destination's name) and swaps the view
 * behind it; browser back/forward work, and every in-page `<a href="#id">` becomes a screen change.
 */
export function useTourRouter({ ids, labelFor, onOverlay }: Options) {
  const readHash = useCallback(() => {
    const h = window.location.hash.slice(1);
    return ids.includes(h) && !OVERLAYS.has(h) ? h : null;
  }, [ids]);

  const [view, setView] = useState<string | null>(readHash);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const indexRef = useRef<HTMLSpanElement | null>(null);
  const busy = useRef(false);
  /** Last screen change requested while a curtain was running; it plays right after. */
  const pending = useRef<{ to: string | null; apply: () => void } | null>(null);
  const transitionRef = useRef<(to: string | null, apply: () => void) => void>(() => {});

  /**
   * Curtain: two layers of vertical strips cascade up (accent, then near-black), the destination's
   * number and name rise letter by letter, the view swaps underneath, then everything lifts off
   * the top in the same cascade while the new screen settles in from below.
   */
  const transition = useCallback(
    (to: string | null, apply: () => void) => {
      const curtain = curtainRef.current;
      const label = labelRef.current;
      if (!curtain || !label || !window.matchMedia(MOTION_OK).matches) {
        apply();
        return;
      }
      if (busy.current) {
        pending.current = { to, apply };
        return;
      }
      busy.current = true;

      const q = gsap.utils.selector(curtain);
      const back = q("[data-strip='a']");
      const front = q("[data-strip='b']");
      const bar = q("[data-bar]");
      const pos = to ? ids.indexOf(to) : -1;
      if (indexRef.current) indexRef.current.textContent = pos >= 0 ? `${String(pos + 1).padStart(2, "0")} / ${String(ids.length).padStart(2, "0")}` : "";
      label.textContent = labelFor(to);
      const split = unclipMasks(SplitText.create(label, { type: "chars", mask: "chars" }));

      gsap
        .timeline({
          defaults: { ease: "power4.inOut" },
          onComplete: () => {
            split.revert();
            busy.current = false;
            const next = pending.current;
            pending.current = null;
            if (next) transitionRef.current(next.to, next.apply);
          },
        })
        .set(curtain, { autoAlpha: 1 })
        .set([back, front], { scaleY: 0, transformOrigin: "50% 100%" })
        .set(bar, { scaleX: 0, transformOrigin: "0% 50%" })
        .to(back, { scaleY: 1, duration: 0.5, stagger: 0.035 }, 0)
        .to(front, { scaleY: 1, duration: 0.5, stagger: 0.035 }, 0.1)
        .from(indexRef.current, { autoAlpha: 0, y: 12, duration: 0.4, ease: "power2.out" }, 0.42)
        .from(split.chars, { yPercent: 115, duration: 0.6, stagger: 0.025, ease: "power3.out" }, 0.4)
        .to(bar, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0.52)
        .call(apply, [], 0.78)
        .addLabel("out", "+=0.15")
        .to(split.chars, { yPercent: -115, duration: 0.4, stagger: 0.018, ease: "power3.in" }, "out")
        .to([indexRef.current, bar], { autoAlpha: 0, duration: 0.25 }, "out")
        .set([back, front], { transformOrigin: "50% 0%" }, "out+=0.25")
        .to(front, { scaleY: 0, duration: 0.5, stagger: 0.035 }, "out+=0.25")
        .to(back, { scaleY: 0, duration: 0.5, stagger: 0.035 }, "out+=0.33")
        .fromTo("#smooth-content main", { y: 90 }, { y: 0, duration: 1, ease: "power3.out", clearProps: "transform" }, "out+=0.35")
        .set(curtain, { autoAlpha: 0 })
        .set([indexRef.current, bar], { autoAlpha: 1 });
    },
    [ids, labelFor],
  );
  useEffect(() => {
    transitionRef.current = transition;
  }, [transition]);

  const navigate = useCallback(
    (id: string | null) => {
      if (id && OVERLAYS.has(id)) {
        onOverlay(id);
        return;
      }
      if (id === view) return;
      transition(id, () => {
        setView(id);
        const url = id ? `#${id}` : window.location.pathname + window.location.search;
        window.history.pushState({ room: id }, "", url);
      });
    },
    [view, transition, onOverlay],
  );

  // Back/forward: follow the URL (overlays manage their own history entries).
  useEffect(() => {
    const onPop = () => {
      if (OVERLAYS.has(window.location.hash.slice(1))) return;
      const next = readHash();
      if (next !== view) transition(next, () => setView(next));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [readHash, transition, view]);

  // In-page links: "#" goes home, "#<screen>" opens that screen.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const hash = link.getAttribute("href") ?? "";
      const id = hash.slice(1);
      if (hash !== "#" && !ids.includes(id)) return;
      event.preventDefault();
      navigate(hash === "#" ? null : id);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [ids, navigate]);

  // New screen: start at the top and re-measure every scroll animation.
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTop(0);
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [view]);

  return { view, navigate, curtainRef, labelRef, indexRef };
}
