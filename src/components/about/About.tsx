import type { SiteContent } from "../../types/content";
import { HelpTip } from "../shared/HelpTip";
import { useRef, type ReactNode } from "react";
import { useCascade, useCountUp, useSplitReveal } from "../../hooks/useFx";
import { gsap, MOTION_OK, SplitText, useGSAP } from "../../lib/gsap";

import { compactDuration, monthIndex, workedMonths } from "../../lib/format";

type Stat = SiteContent["about"]["stats"][number];
type Job = SiteContent["experience"]["items"][number];

function CountUp({ text }: { text: string }) {
  const ref = useCountUp<HTMLSpanElement>(text);
  return (
    <span ref={ref} className="[font-family:var(--font-display)] text-[clamp(2.2rem,4vw,2.9rem)] font-extrabold leading-none tracking-[-0.03em] text-text-main tabular-nums">
      {text}
    </span>
  );
}

/** "WCOGEO Administradora e Serviços" -> "WCOGEO", "Grupo OTG" stays whole. */
const shortCompany = (name: string) => name.split(" ").slice(0, name.startsWith("Grupo ") ? 2 : 1).join(" ");

/** Career strip: every job as a segment between the first start and today; `hot` ones in the accent. */
function Strip({ jobs, hot }: { jobs: Job[]; hot: (j: Job) => boolean }) {
  const a = Math.min(...jobs.map((j) => monthIndex(j.start)));
  const b = monthIndex(null) + 1;
  const pct = (m: number) => ((m - a) / (b - a)) * 100;
  const first = jobs.reduce((x, j) => (monthIndex(j.start) < monthIndex(x.start) ? j : x), jobs[0]);
  return (
    <div>
      <div className="relative h-3 border border-text-main bg-surface-2">
        {jobs.map((j) => (
          <span
            key={j.company + j.start}
            data-seg
            className={`absolute inset-y-0 ${hot(j) ? "bg-accent" : "bg-text-main/35"}`}
            style={{ left: `${pct(monthIndex(j.start))}%`, width: `max(2px, ${pct(monthIndex(j.end) + 1) - pct(monthIndex(j.start))}%)` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between [font-family:var(--font-mono)] text-[.68rem] text-text-faint">
        <span>{first?.start.slice(0, 4)}</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

/** Rising steps for a climb (intern -> developer -> coordinator). */
function Ladder({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-end gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 flex-col items-start gap-1">
          <span className="[font-family:var(--font-mono)] text-[.62rem] uppercase tracking-wide text-text-faint">{s}</span>
          <span
            data-seg
            className={`block w-full border border-text-main ${i === steps.length - 1 ? "bg-accent" : "bg-surface-2"}`}
            style={{ height: `${10 + i * 12}px` }}
          />
        </div>
      ))}
    </div>
  );
}

function Names({ names, hot }: { names: string[]; hot?: (n: string) => boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {names.map((n) => (
        <li key={n} data-seg className={`tag ${hot?.(n) ? "border-accent text-accent" : "text-text-muted"}`}>
          {n}
        </li>
      ))}
    </ul>
  );
}

interface AboutProps {
  about: SiteContent["about"];
  experience: SiteContent["experience"]["items"];
  helpLabel: string;
  lang: string;
}

export function About({ about, experience, helpLabel, lang }: AboutProps) {
  // Companies oldest -> current (timeline order is newest first).
  const companies = [...new Set([...experience].reverse().map((j) => shortCompany(j.company)))];
  const current = experience.filter((j) => j.end === null);

  /** Headline value and the small chart for each card, all derived from the timeline. */
  const render = (stat: Stat): { value: string; viz: ReactNode } => {
    switch (stat.compute) {
      case "experience":
        return { value: compactDuration(workedMonths(experience), lang), viz: <Strip jobs={experience} hot={() => true} /> };
      case "leadership":
        return {
          value: compactDuration(workedMonths(experience.filter((j) => j.leadership)), lang),
          viz: <Strip jobs={experience} hot={(j) => !!j.leadership} />,
        };
      case "ladder": {
        const jobs = experience.filter((j) => j.company.includes(stat.company ?? ""));
        const starts = jobs.map((j) => monthIndex(j.start));
        return { value: compactDuration(Math.max(...starts) - Math.min(...starts), lang), viz: <Ladder steps={stat.steps ?? []} /> };
      }
      case "companies":
        return { value: String(companies.length), viz: <Names names={companies} hot={(n) => current.some((j) => shortCompany(j.company) === n)} /> };
      case "parallel":
        return { value: String(current.length), viz: <Names names={current.map((j) => shortCompany(j.company))} hot={() => true} /> };
      default:
        return { value: stat.value ?? "", viz: stat.note ? <p className="text-[.85rem] leading-snug text-text-muted">{stat.note}</p> : null };
    }
  };

  const textRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useSplitReveal<HTMLHeadingElement>(about.heading);

  // Reading spotlight: the story lights up word by word as you scroll through it.
  useGSAP(
    () => {
      const el = textRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el.querySelectorAll("p"), {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } },
            ),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { dependencies: [about.paragraphs.join("|")], revertOnUpdate: true },
  );
  const statsRef = useCascade<HTMLDListElement>("[data-card]", about.stats.map((st) => st.label).join("|"), { stagger: 0.08 });

  return (
    <section className="relative scroll-mt-16 py-16 md:py-24" id="sobre">
      <div className="container-shell">
        <div className="grid gap-6 pt-6 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="label-mono md:sticky md:top-24 md:self-start">{about.eyebrow}</div>
          <div className="min-w-0">
            <div className="max-w-[760px]">
              <h2 ref={titleRef} className="mb-6 [font-family:var(--font-heading)] text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-tight tracking-[-0.015em]">
                {about.heading}
              </h2>
              <div ref={textRef} className="space-y-5 text-[clamp(1.15rem,1.9vw,1.45rem)] leading-[1.55] text-text-main [&_strong]:font-semibold [&_strong]:text-accent">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                ))}
              </div>
            </div>
            <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" ref={statsRef}>
              {about.stats.map((stat) => {
                const { value, viz } = render(stat);
                return (
                  <div key={stat.label} data-card className="card-hard card-hover flex flex-col gap-4 p-5">
                    <div>
                      <dt className="flex items-start justify-between gap-2">
                        <CountUp text={value} />
                        <HelpTip text={stat.help} label={`${helpLabel}: ${stat.label}`} />
                      </dt>
                      <dd className="mt-2 text-[.92rem] leading-snug text-text-muted">{stat.label}</dd>
                    </div>
                    {viz ? <div className="mt-auto">{viz}</div> : null}
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
