import { useRef, useState } from "react";
import type { InitiativeItem, InitiativeShowcase, SiteContent } from "../../types/content";
import { useCascade, useCountUp } from "../../hooks/useFx";
import { Section } from "../shared/SectionHead";
import { formatMonth } from "../../lib/format";
import { gsap, MOTION_OK, ScrollTrigger, SplitText, unclipMasks, useGSAP } from "../../lib/gsap";

/** Event palette, taken from the DataHack logo (always on a dark panel, in both themes). */
const NAVY = "#0c0b24";
const CYAN = "#19e6f2";
const MAGENTA = "#e83cf0";
const EMBEDS_KEY = "datahack-embeds";

function CountUp({ text, className }: { text: string; className: string }) {
  const ref = useCountUp<HTMLElement>(text);
  return (
    <dt ref={ref} className={className}>
      {text}
    </dt>
  );
}

interface InitiativesProps {
  initiatives: SiteContent["initiatives"];
  dates: SiteContent["ui"]["dates"];
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((bullet) => (
        <li
          key={bullet}
          className="relative pl-4 text-[.98rem] leading-relaxed text-text-muted before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2 before:bg-text-faint"
        >
          {bullet}
        </li>
      ))}
    </ul>
  );
}

/** Plain block (used when there is no showcase data). */
function InitiativeBlock({ item, dates }: { item: InitiativeItem; dates: SiteContent["ui"]["dates"] }) {
  const ref = useCascade<HTMLDivElement>("h3, li, dl > div", item.name + item.bullets.length, { stagger: 0.07 });
  return (
    <article className="max-w-[720px]" ref={ref}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[1.05rem] font-semibold text-text-main">{item.role}</h3>
        <span className="[font-family:var(--font-mono)] text-[.8rem] text-text-faint">
          {item.org} · {formatMonth(item.start, dates)} · {item.location} · {item.kind}
        </span>
      </div>
      <div className="mt-4">
        <Bullets items={item.bullets} />
      </div>
      <dl className="mt-8 grid grid-cols-3 border-y border-border-subtle">
        {item.facts.map((fact) => (
          <div key={fact.label} className="border-l border-border-subtle py-4 pl-4 first:border-l-0 first:pl-0">
            <CountUp text={fact.value} className="[font-family:var(--font-mono)] text-[1.7rem] font-medium leading-none text-text-main tabular-nums" />
            <dd className="mt-2 text-sm text-text-muted">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/** Podium columns in "reveal mode" order: 3rd rises first, the winner last. */
const PODIUM_LAYOUT = [
  { index: 1, height: "h-[110px] md:h-[160px]" },
  { index: 0, height: "h-[150px] md:h-[220px]" },
  { index: 2, height: "h-[80px] md:h-[115px]" },
];

function Showcase({ item, show }: { item: InitiativeItem; show: InitiativeShowcase }) {
  const root = useRef<HTMLDivElement | null>(null);
  const base = import.meta.env.BASE_URL;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);

        // Intro panel: line draws, logo wipes in, tagline rises word by word.
        // autoSplit waits for the fonts and re-splits on resize; the returned tween is managed by SplitText.
        const split = SplitText.create(q("[data-tagline]"), {
          type: "words",
          mask: "words",
          autoSplit: true,
          onSplit: (self) => gsap.from(unclipMasks(self).words, { yPercent: 110, duration: 0.7, stagger: 0.04, ease: "power3.out", delay: 0.7 }),
        });
        gsap
          .timeline({ delay: 0.25 })
          .from(q("[data-line]"), { drawSVG: "0%", duration: 1.1, ease: "power2.inOut" })
          .from(q("[data-logo]"), { clipPath: "inset(0 100% 0 0)", duration: 0.9, ease: "power3.out" }, 0.1)
          .from(q("[data-intro-rest]"), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.08 }, 0.8);

        // Photo: clip reveal with a slow zoom-out.
        gsap
          .timeline({ scrollTrigger: { trigger: q("[data-photo]")[0], start: "top 80%", once: true } })
          .from(q("[data-photo]"), { clipPath: "inset(100% 0 0 0)", duration: 1, ease: "power3.inOut" })
          .from(q("[data-photo] img"), { scale: 1.25, duration: 1.4, ease: "power2.out" }, 0);

        // Podium: columns rise one by one (3rd, 2nd, 1st), then the names drop on top.
        const cols = ["[data-col='2']", "[data-col='1']", "[data-col='0']"].map((s) => q(s)[0]).filter(Boolean);
        gsap
          .timeline({ scrollTrigger: { trigger: q("[data-podium]")[0], start: "top 75%", once: true } })
          .from(cols.map((c) => c.querySelector("[data-block]")), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, stagger: 0.45, ease: "back.out(1.4)" })
          .from(cols.map((c) => c.querySelector("[data-team]")), { autoAlpha: 0, y: -18, duration: 0.5, stagger: 0.45, ease: "power2.out" }, 0.35);

        gsap.from(q("[data-post]"), {
          autoAlpha: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: q("[data-posts]")[0], start: "top 80%", once: true },
        });

        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // LinkedIn embeds are blank for signed-out viewers (and a site can't tell who is signed in),
  // so posts start as text cards; the embeds load on request and that choice is remembered.
  const [embeds, setEmbeds] = useState(() => {
    try {
      return localStorage.getItem(EMBEDS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const showEmbeds = () => {
    setEmbeds(true);
    window.setTimeout(() => ScrollTrigger.refresh(), 60);
    try {
      localStorage.setItem(EMBEDS_KEY, "1");
    } catch {
      /* storage unavailable: the choice just isn't remembered */
    }
  };

  const bulletsRef = useCascade<HTMLDivElement>("li", item.bullets.join("").length + "", { stagger: 0.07 });

  return (
    <div ref={root} className="flex flex-col gap-16 md:gap-24">
      {/* Intro panel */}
      <div className="relative overflow-hidden border-[1.5px] border-text-main shadow-[8px_8px_0_var(--accent)]" style={{ background: NAVY }}>
        <svg className="pointer-events-none absolute inset-x-0 top-6 h-2 w-full" viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="dh-line" x1="0" x2="1">
              <stop offset="0" stopColor={MAGENTA} />
              <stop offset="1" stopColor={CYAN} />
            </linearGradient>
          </defs>
          <path data-line d="M0 4 H1000" stroke="url(#dh-line)" strokeWidth="4" strokeDasharray="38 14 8 14" fill="none" />
        </svg>

        <div className="relative grid gap-10 px-6 pb-10 pt-14 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-14 md:pt-20">
          <div>
            <img data-logo src={`${base}${show.logo}`} alt={show.logoAlt} width={700} height={233} className="h-auto w-full max-w-[420px]" />
            <p data-intro-rest className="mt-8 [font-family:var(--font-mono)] text-[.78rem] uppercase tracking-[0.08em]" style={{ color: CYAN }}>
              {show.edition}
            </p>
            <h2 data-tagline className="mt-3 [font-family:var(--font-display)] text-[clamp(1.8rem,4.2vw,3rem)] font-semibold leading-[1.05] text-white">
              {show.tagline}
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p data-intro-rest className="text-[1.02rem] leading-relaxed text-white/75">
              {show.challenge}
            </p>
            <div data-intro-rest>
              <a
                href={show.link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-[1.5px] px-5 py-3 text-[.95rem] font-semibold transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{ borderColor: CYAN, color: CYAN, boxShadow: `4px 4px 0 ${MAGENTA}` }}
              >
                {show.link.label} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers */}
      <dl className="grid grid-cols-2 border-y-[1.5px] border-text-main md:grid-cols-4">
        {item.facts.map((fact, i) => (
          <div key={fact.label} className={`px-4 py-6 md:px-6 ${i % 2 ? "border-l border-border-subtle" : ""} ${i > 0 ? "md:border-l md:border-border-subtle" : ""} ${i > 1 ? "border-t border-border-subtle md:border-t-0" : ""}`}>
            <CountUp text={fact.value} className="[font-family:var(--font-display)] text-[clamp(2.6rem,6vw,4.2rem)] font-semibold leading-none text-accent tabular-nums" />
            <dd className="mt-2 text-[.92rem] text-text-muted">{fact.label}</dd>
          </div>
        ))}
      </dl>

      {/* What I did + photo */}
      <div className="grid items-start gap-10 md:grid-cols-[1fr_1.15fr] md:gap-14">
        <div ref={bulletsRef}>
          <div className="label-mono">{show.highlightsHeading}</div>
          <h3 className="mt-3 [font-family:var(--font-heading)] text-[1.4rem] font-semibold leading-tight">
            {item.role} <span className="font-normal text-text-faint">· {item.kind}</span>
          </h3>
          <div className="mt-5">
            <Bullets items={item.bullets} />
          </div>
        </div>
        <figure>
          <div data-photo className="overflow-hidden border-[1.5px] border-text-main shadow-[6px_6px_0_var(--text)]">
            <img src={`${base}${show.photo.src}`} alt={show.photo.alt} width={1600} height={900} loading="lazy" className="block h-auto w-full" />
          </div>
          <figcaption className="mt-3 [font-family:var(--font-mono)] text-[.78rem] text-text-faint">{show.photo.caption}</figcaption>
        </figure>
      </div>

      {/* Podium */}
      <div data-podium>
        <div className="label-mono">{show.podium.heading}</div>
        <div className="mx-auto mt-8 grid max-w-[640px] grid-cols-3 items-end gap-3 md:gap-5">
          {PODIUM_LAYOUT.map(({ index, height }) => {
            const p = show.podium.places[index];
            if (!p) return <div key={index} />;
            const first = index === 0;
            return (
              <div key={p.team} data-col={index} className="flex flex-col items-center text-center">
                <span data-team className={`mb-3 font-semibold leading-tight ${first ? "text-[1.05rem] md:text-[1.25rem]" : "text-[.92rem] md:text-[1.05rem]"}`}>
                  {p.team}
                </span>
                <div
                  data-block
                  className={`flex w-full items-start justify-center border-[1.5px] border-text-main pt-3 ${height} ${first ? "bg-accent text-on-accent shadow-[5px_5px_0_var(--text)]" : "bg-surface shadow-[4px_4px_0_var(--text)]"}`}
                >
                  <span className="[font-family:var(--font-display)] text-[clamp(1.8rem,5vw,3rem)] font-semibold leading-none">{p.place}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[.95rem] text-text-muted">{show.podium.note}</p>
        <div className="mt-8 text-center">
          <div className="label-mono">{show.podium.winnerLabel}</div>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {show.podium.winnerStack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* LinkedIn posts */}
      <div data-posts>
        <h3 className="[font-family:var(--font-heading)] text-[clamp(1.4rem,2.8vw,2rem)] font-semibold leading-tight">{show.posts.heading}</h3>
        <div className="mt-8 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
          {show.posts.items.map((post) => (
            <article key={post.url} data-post className="card-hard flex flex-col overflow-hidden">
              <header className="flex items-start justify-between gap-3 border-b-[1.5px] border-text-main px-4 py-3">
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{post.author}</div>
                  <div className="[font-family:var(--font-mono)] text-[.74rem] text-text-faint">{post.role}</div>
                </div>
                <a href={post.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm shrink-0" aria-label={`${show.posts.open}: ${post.author}`}>
                  ↗
                </a>
              </header>
              {post.embed && embeds ? (
                <div className="relative bg-white">
                  <span className="absolute inset-0 grid place-items-center text-[.85rem] text-neutral-400" aria-hidden="true">
                    LinkedIn…
                  </span>
                  <iframe
                    src={post.embed}
                    title={`${post.author} · LinkedIn`}
                    height={post.height}
                    loading="lazy"
                    className="relative block w-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4 px-5 py-6">
                  {post.quote?.map((q) => (
                    <p key={q} className="text-[1rem] leading-relaxed text-text-muted first:[font-family:var(--font-heading)] first:text-[1.25rem] first:font-semibold first:leading-snug first:text-text-main">
                      {q}
                    </p>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <a href={post.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                      {show.posts.open} <span aria-hidden="true">↗</span>
                    </a>
                    {post.embed ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={showEmbeds}>
                        {show.posts.embedLabel}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Initiatives({ initiatives, dates }: InitiativesProps) {
  const item = initiatives.items[0];
  if (initiatives.showcase && item) {
    return (
      <section id="iniciativas" className="relative py-10 md:py-14">
        <div className="container-shell">
          <Showcase item={item} show={initiatives.showcase} />
        </div>
      </section>
    );
  }
  return (
    <Section id="iniciativas" config={initiatives.sectionHead}>
      <div className="flex flex-col gap-16">
        {initiatives.items.map((it) => (
          <InitiativeBlock key={it.name} item={it} dates={dates} />
        ))}
      </div>
    </Section>
  );
}
