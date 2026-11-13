import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteContent } from "../../types/content";
import { TourPreview } from "./TourPreview";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";

export interface TourItem {
  id: string;
  label: string;
  hint: string;
}

interface TourMenuProps {
  eyebrow: string;
  items: TourItem[];
  content: SiteContent;
}

/**
 * Home menu: one big typographic row per screen. Rows are hash links (the App router opens the
 * screen). On mouse/trackpad, a preview card follows the cursor with a small animation of the
 * hovered screen. Rows slide in from the left when the menu appears.
 */
export function TourMenu({ eyebrow, items, content }: TourMenuProps) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // Last shown preview: stays in the card while it fades out.
  const [shown, setShown] = useState<string | null>(null);
  const fine = useMemo(() => window.matchMedia(`(pointer: fine) and ${MOTION_OK}`).matches, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(gsap.utils.toArray("[data-row]", listRef.current), {
          xPercent: -6,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.6,
        });
      });
      return () => mm.revert();
    },
    { scope: listRef, dependencies: [items.map((i) => i.label).join("|")], revertOnUpdate: true },
  );

  // Card follows the pointer with a little lag; scales in/out with the hover.
  useEffect(() => {
    if (!fine) return;
    const card = cardRef.current;
    if (!card) return;
    const x = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      x(e.clientX + 28);
      y(e.clientY - 110);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine]);

  useEffect(() => {
    if (!fine || !cardRef.current) return;
    gsap.to(cardRef.current, {
      autoAlpha: hovered ? 1 : 0,
      scale: hovered ? 1 : 0.85,
      rotate: hovered ? -2 : 0,
      duration: 0.3,
      ease: hovered ? "back.out(1.8)" : "power2.in",
    });
  }, [hovered, fine]);

  return (
    <nav aria-label={eyebrow} className="container-shell pb-16 pt-10 md:pb-24">
      <div className="label-mono mb-4">{eyebrow}</div>
      <ol ref={listRef} className="border-t-[1.5px] border-text-main" onMouseLeave={() => setHovered(null)}>
        {items.map((item, i) => (
          <li key={item.id} data-row>
            <a
              href={`#${item.id}`}
              onMouseEnter={() => {
                setHovered(item.id);
                setShown(item.id);
              }}
              onFocus={() => {
                setHovered(item.id);
                setShown(item.id);
              }}
              onBlur={() => setHovered(null)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-border-subtle py-3 transition-colors hover:text-accent md:grid-cols-[3.5rem_1fr_auto_auto] md:gap-6 md:py-4"
            >
              <span className="[font-family:var(--font-mono)] text-[.8rem] text-text-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="[font-family:var(--font-display)] text-[clamp(2rem,6vw,4.4rem)] font-semibold leading-[1] tracking-[-0.01em] transition-transform duration-300 group-hover:translate-x-3">
                {item.label}
              </span>
              <span className="hidden text-right text-[.9rem] text-text-muted md:block">{item.hint}</span>
              <span className="text-[1.6rem] leading-none transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ol>

      {fine
        ? createPortal(
            <div
              ref={cardRef}
              className="pointer-events-none fixed left-0 top-0 z-[140] h-[220px] w-[300px] border-[1.5px] border-text-main bg-surface p-4 opacity-0 shadow-[6px_6px_0_var(--accent)]"
              aria-hidden="true"
            >
              {shown ? <TourPreview key={shown} id={shown} content={content} /> : null}
            </div>,
            document.body,
          )
        : null}
    </nav>
  );
}
