import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, useGSAP);

/** Every animation is added under this media query, so "reduce motion" users get the static page. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** Offset for in-page jumps, so section tops land below the fixed nav. */
export const NAV_OFFSET = 72;

/**
 * Scroll to an element, through ScrollSmoother when it is active (native anchors can't reach
 * content inside the smoothed wrapper), otherwise with the browser's smooth scroll.
 */
export function scrollToTarget(target: Element | string | null) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(el, true, `top ${NAV_OFFSET}px`);
  } else {
    el.scrollIntoView({ behavior: window.matchMedia(MOTION_OK).matches ? "smooth" : "auto", block: "start" });
  }
}

/** Scroll to an absolute page position (px), through ScrollSmoother when active. */
export function scrollToY(y: number) {
  const top = Math.max(0, Math.round(y));
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(top, true);
  else window.scrollTo({ top, behavior: window.matchMedia(MOTION_OK).matches ? "smooth" : "auto" });
}

/**
 * Position of an element in the page flow (sum of offsetTop), ignoring transforms.
 * For pinned elements, measures the pin-spacer ScrollTrigger wraps them in, which never moves.
 */
export function flowTop(el: HTMLElement): number {
  let node: HTMLElement | null = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
  let y = 0;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, useGSAP };
