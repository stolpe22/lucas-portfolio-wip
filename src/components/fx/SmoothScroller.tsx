import { useEffect, useLayoutEffect } from "react";
import { gsap, MOTION_OK, ScrollSmoother, ScrollTrigger } from "../../lib/gsap";

/**
 * Inertial smooth scrolling for the page (#smooth-wrapper > #smooth-content).
 * Rendered before the page sections so the smoother exists before their ScrollTriggers
 * (layout effects run in tree order), which lets pinned sections use transform pinning.
 * Mouse/trackpad + motion allowed only; touch devices keep native scrolling.
 */
export function SmoothScroller() {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(`(pointer: fine) and ${MOTION_OK}`, () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        effects: true,
        smoothTouch: false,
      });
      return () => smoother.kill();
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    // Fonts and images change the page height: keep every trigger measured correctly.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
