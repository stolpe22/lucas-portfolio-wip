import { useRef } from "react";
import type { SiteContent } from "../../types/content";
import { gsap, MOTION_OK, useGSAP } from "../../lib/gsap";
import { useSplitReveal } from "../../hooks/useFx";
import { ServiceArt } from "./ServiceArt";

const PIN_ROW = `(min-width: 1024px) and (min-height: 760px) and ${MOTION_OK}`;

interface ServicesProps {
  services: SiteContent["services"];
  ui: SiteContent["ui"]["services"];
}

/**
 * "What I deliver": on desktop the section pins and the cards travel sideways as you scroll
 * (scrubbed horizontal scroll); a counter and a progress line follow along.
 * On phones (or with reduced motion) the cards simply stack.
 */
export function Services({ services, ui }: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const headingRef = useSplitReveal<HTMLHeadingElement>(services.sectionHead.heading);
  const total = services.items.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Each card's little illustration assembles itself once (see ServiceArt for the tags).
      const artTimeline = (card: HTMLElement, scrollTrigger: ScrollTrigger.Vars) => {
        const q = gsap.utils.selector(card);
        if (!q("[data-art-grow], [data-art-draw], [data-art-pop], [data-art-type]").length) return;
        const tl = gsap.timeline({ scrollTrigger, defaults: { ease: "power3.out" } });
        // Only the element kinds this drawing actually has (empty targets make GSAP warn).
        const add = (sel: string, vars: gsap.TweenVars, at: number) => {
          const els = q(sel);
          if (els.length) tl.from(els, vars, at);
        };
        add("[data-art-grow]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, stagger: 0.07 }, 0);
        add("[data-art-pop]", { scale: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.1, ease: "back.out(2)" }, 0);
        add("[data-art-draw]", { drawSVG: "0%", duration: 0.6, stagger: 0.1, ease: "power1.inOut" }, 0.15);
        add("[data-art-type]", { autoAlpha: 0, x: -6, duration: 0.25, stagger: 0.18 }, 0.1);
      };

      // Same condition as the `pinrow` CSS variant: pin only when a whole card fits on screen.
      mm.add(PIN_ROW, () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;
        const distance = () => track.scrollWidth - track.parentElement!.clientWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.min(total, Math.floor(self.progress * total) + 1);
              if (counterRef.current) counterRef.current.textContent = String(i).padStart(2, "0");
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        // Cards come in from the right with depth; their content is always visible.
        gsap.utils.toArray<HTMLElement>("[data-service]", track).forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.9, rotateY: -14, transformPerspective: 1200, transformOrigin: "0% 50%" },
            {
              scale: 1,
              rotateY: 0,
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-service]", track).forEach((card) => {
          artTimeline(card, { trigger: card, containerAnimation: tween, start: "left 80%", toggleActions: "play none none none" });
        });

        gsap.from(gsap.utils.toArray("[data-service]", track).slice(0, 3), {
          y: 60,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        });
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}, (min-width: 1024px) and (max-height: 759.98px) and ${MOTION_OK}`, () => {
        gsap.utils.toArray<HTMLElement>("[data-service]", trackRef.current).forEach((card) => {
          gsap.from(card, { y: 50, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } });
          artTimeline(card, { trigger: card, start: "top 80%", toggleActions: "play none none none" });
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [services.items.length, services.sectionHead.heading], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className="relative scroll-mt-16 overflow-hidden py-16 md:py-24 pinrow:flex pinrow:h-screen pinrow:flex-col pinrow:justify-center pinrow:pb-6 pinrow:pt-20"
    >
      <div className="container-shell">
        <div className="grid gap-6 border-t border-border-strong pt-6 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="label-mono">{services.sectionHead.eyebrow}</div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[680px]">
              <h2
                ref={headingRef}
                className="[font-family:var(--font-heading)] text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
              >
                {services.sectionHead.heading}
              </h2>
              {services.sectionHead.subheading ? <p className="mt-3 text-[1.02rem] text-text-muted">{services.sectionHead.subheading}</p> : null}
            </div>
            {/* Desktop progress: 01 / 04 and a line that fills while the cards travel. */}
            <div className="hidden items-center gap-3 [font-family:var(--font-mono)] text-sm text-text-muted pinrow:flex" aria-hidden="true">
              <span ref={counterRef} className="text-text-main">
                01
              </span>
              <span className="relative h-px w-24 bg-border-strong">
                <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent"></span>
              </span>
              <span>{String(total).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pinrow:mt-8 pinrow:overflow-hidden">
        <div
          ref={trackRef}
          className="mx-auto flex max-w-[1120px] flex-col gap-5 px-[clamp(16px,5vw,56px)] deskgrid:grid deskgrid:grid-cols-2 deskgrid:grid-rows-[repeat(2,minmax(0,1fr))_auto] deskgrid:gap-6 pinrow:mx-0 pinrow:w-max pinrow:max-w-none pinrow:flex-row pinrow:items-stretch pinrow:gap-6 pinrow:pl-[max(clamp(16px,5vw,56px),calc((100vw-1120px)/2+clamp(16px,5vw,56px)))] pinrow:pr-[22vw]"
        >
          {services.items.map((item, index) => (
            <article
              key={item.title}
              data-service
              className="card-hard spotlight group relative flex shrink-0 flex-col p-6 md:p-7 pinrow:w-[min(40vw,520px)]"
            >
              <div className="flex items-start justify-between gap-4" title={ui.label}>
                <ServiceArt kind={index} />
                <span className="[font-family:var(--font-display)] text-[2.6rem] font-semibold leading-none text-accent/25 transition-colors group-hover:text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 [font-family:var(--font-heading)] text-[1.45rem] font-semibold leading-tight">{item.title}</h3>
              <p className="mt-3 text-[.98rem] leading-relaxed text-text-muted">
                <span className="label-mono mb-1 block">{ui.problem}</span>
                {item.problem}
              </p>
              <div className="mt-4">
                <span className="label-mono mb-2 block">{ui.deliver}</span>
                <ul className="flex flex-col gap-1.5">
                  {item.deliver.map((d) => (
                    <li
                      key={d}
                      className="relative pl-4 text-[.95rem] leading-snug text-text-main before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:bg-accent"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-5 [font-family:var(--font-mono)] text-[.78rem] leading-relaxed text-text-faint">{item.tools.join("  ·  ")}</div>
            </article>
          ))}

          {/* Last "card": call to action. */}
          <a
            href="#contato"
            data-service
            className="group flex shrink-0 flex-col justify-center border-[1.5px] border-text-main bg-accent p-8 text-on-accent shadow-[6px_6px_0_var(--text)] transition-[transform,box-shadow] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[9px_9px_0_var(--text)] deskgrid:col-span-2 pinrow:w-[min(26vw,320px)]"
          >
            <span className="[font-family:var(--font-heading)] text-[1.6rem] font-semibold leading-tight">{ui.cta}</span>
            <span className="mt-4 text-3xl transition-transform group-hover:translate-x-2" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
