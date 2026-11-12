import { useEffect, useLayoutEffect } from "react";
import { gsap, MOTION_OK, ScrollSmoother, ScrollTrigger, scrollToTarget } from "../../lib/gsap";

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
      // Start where the URL says (e.g. /#experiencia) once the smoother is in place.
      if (window.location.hash && window.location.hash !== "#marcos") {
        requestAnimationFrame(() => scrollToTarget(window.location.hash));
      }
      return () => smoother.kill();
    });
    return () => mm.revert();
  }, []);

  // In-page anchors (#section) go through the smoother; native jumps can't reach smoothed content.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#" || hash === "#marcos") return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      window.history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    // Fonts and images change the page height: keep every trigger measured correctly.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
