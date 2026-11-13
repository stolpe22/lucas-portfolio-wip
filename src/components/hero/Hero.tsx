import { useRef } from "react";
import type { ExperienceItem, SiteContent } from "../../types/content";
import { DownloadIcon, MilestonesIcon } from "../shared/icons";
import { gsap, MOTION_OK, SplitText, unclipMasks, useGSAP } from "../../lib/gsap";
import { DataCube3D } from "./DataCube3D";

interface HeroProps {
  hero: SiteContent["hero"];
  wordmarkAlt: string;
  currentJobs: ExperienceItem[];
  currentLabel: string;
  onDownloadResume: () => void;
  onOpenMilestones: () => void;
}

function resolvePublicSrc(src: string | undefined) {
  if (!src) return src;
  return src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;
}

// Compare mode: /?hero=3d shows the experimental 3D data cube instead of the framed photo backdrop.
const hero3d = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("hero") === "3d";

export function Hero({ hero, wordmarkAlt, currentJobs, currentLabel, onDownloadResume, onOpenMilestones }: HeroProps) {
  const photoSrc = resolvePublicSrc(hero.photo);
  const rootRef = useRef<HTMLElement | null>(null);

  // Intro timeline + scroll parallax. Elements marked [data-hero] are the choreography steps.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(rootRef);
        const name = q("[data-hero=name]")[0] as HTMLElement | undefined;
        // Hide the name until the display font is in, then split by character and animate.
        if (name) gsap.set(name, { autoAlpha: 0 });
        let split: SplitText | null = null;

        const tl = gsap.timeline({ defaults: { ease: "power4.out" }, paused: true });
        tl.from(q("[data-hero=eyebrow]"), { y: 16, autoAlpha: 0, duration: 0.6 }, 0);
        // The framed backdrop doesn't exist in ?hero=3d mode.
        if (q("[data-hero=arc]").length) tl.from(q("[data-hero=arc]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 1.1, ease: "expo.out" }, 0.2);
        tl.from(q("[data-hero=photo]"), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08, duration: 1.2, ease: "expo.out" }, 0.3)
          .from(q("[data-hero=role]"), { y: 20, autoAlpha: 0, duration: 0.7 }, 0.6)
          .from(q("[data-hero=desc]"), { y: 20, autoAlpha: 0, duration: 0.7 }, 0.75)
          .from(q("[data-hero=cta] > *"), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.9)
          .from(q("[data-hero=status]"), { autoAlpha: 0, duration: 0.6 }, 1.2);

        document.fonts.ready.then(() => {
          if (!name || !rootRef.current) return;
          split = unclipMasks(SplitText.create(name, { type: "chars", mask: "chars" }));
          gsap.set(name, { autoAlpha: 1 });
          tl.from(split.chars, { yPercent: 115, rotate: 6, duration: 1, stagger: 0.035 }, 0.15);
          tl.play(0);
        });

        // Depth on scroll: the name drifts faster than the photo.
        gsap.to(q("[data-hero=text]"), {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(q("[data-hero=figure]"), {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: rootRef.current, start: "top top", end: "bottom top", scrub: true },
        });
        // Exit: the name opens up and fades, the photo pushes in, as the hero scrolls away.
        const exit = { trigger: rootRef.current, start: "30% top", end: "bottom top", scrub: true };
        // Containers only (the intro animates their children), so the two never fight.
        gsap.to(name ?? [], { letterSpacing: "0.06em", ease: "none", scrollTrigger: exit });
        gsap.to(q("[data-hero=text]"), { opacity: 0.15, ease: "none", scrollTrigger: exit });
        gsap.to(q("[data-hero=figure]"), { scale: 1.08, transformOrigin: "50% 100%", ease: "none", scrollTrigger: exit });

        return () => {
          split?.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [wordmarkAlt, hero.role], revertOnUpdate: true },
  );

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden pt-24 md:pt-36" data-light-area>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="dot-grid"></div>
        <div className="dot-grid-lit"></div>
      </div>
      <div className="container-shell">
        <div className="grid items-end gap-8 border-b border-border-strong md:grid-cols-[1.25fr_.75fr] md:gap-6">
          <div className="pb-8 md:pb-20" data-hero="text">
            <div className="label-mono mb-4 md:mb-6" data-hero="eyebrow">
              {hero.eyebrow}
            </div>
            <h1
              data-hero="name"
              className="mb-3 [font-family:var(--font-display)] text-[clamp(2.8rem,8.5vw,5.6rem)] font-semibold leading-[1] tracking-[-0.01em] text-text-main"
            >
              {wordmarkAlt}
            </h1>
            <p data-hero="role" className="mb-6 text-[clamp(1.1rem,2.2vw,1.4rem)] font-medium text-accent">
              {hero.role}
            </p>
            <p data-hero="desc" className="mb-8 max-w-[56ch] text-[1.05rem] leading-relaxed text-text-muted">
              {hero.description}
            </p>

            <div className="flex flex-wrap items-center gap-3" data-hero="cta">
              {hero.ctas.map((cta) => {
                const classes = `btn ${cta.style === "primary" ? "btn-primary" : "btn-ghost"}`;
                if (cta.action) {
                  const isResume = cta.action === "resume";
                  return (
                    <button
                      key={cta.label}
                      type="button"
                      onClick={isResume ? onDownloadResume : onOpenMilestones}
                      className={classes}
                    >
                      {isResume ? <DownloadIcon /> : <MilestonesIcon />}
                      {cta.label}
                    </button>
                  );
                }
                return (
                  <a key={cta.label} href={cta.href} className={classes}>
                    {cta.label}
                  </a>
                );
              })}
            </div>

            {currentJobs.length ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted md:mt-10" data-hero="status">
                <span className="tag-now">{currentLabel}</span>
                {currentJobs.map((job, i) => (
                  <span key={`${job.company}-${job.start}`}>
                    {i > 0 ? <span className="mr-2 text-text-faint">·</span> : null}
                    {job.role}, {job.company}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {photoSrc ? (
            <div className="relative mx-auto w-[200px] self-end sm:w-[240px] md:w-full" data-hero="figure">
              {hero3d ? (
                // Experimental: 3D data cube behind the portrait (?hero=3d).
                <div className="absolute -inset-x-[45%] -top-[25%] bottom-0 -z-10">
                  <DataCube3D />
                </div>
              ) : (
                <>
                  <div data-hero="arc" className="absolute inset-x-[10%] bottom-0 top-[16%] -z-10 translate-x-3 -translate-y-3 bg-accent" aria-hidden="true"></div>
                  <div className="absolute inset-x-[10%] bottom-0 top-[16%] -z-10 border-[1.5px] border-text-main bg-surface-2" aria-hidden="true"></div>
                </>
              )}
              <img
                data-hero="photo"
                src={photoSrc}
                alt={hero.photoAlt || ""}
                className="relative mx-auto w-full max-w-[300px] object-contain md:max-w-[360px]"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
