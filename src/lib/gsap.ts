import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, MotionPathPlugin, useGSAP);

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

/**
 * SplitText masks clip at the line box, which cuts descenders (g, p, ç) under tight leading.
 * Give each mask some room below (and pull the layout back) so letters stay whole.
 */
export function unclipMasks(split: SplitText) {
  split.masks.forEach((m) => {
    (m as HTMLElement).style.paddingBottom = "0.18em";
    (m as HTMLElement).style.marginBottom = "-0.18em";
  });
  return split;
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, MotionPathPlugin, useGSAP };
