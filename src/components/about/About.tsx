import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { HelpTip } from "../shared/HelpTip";
import { workedMonths } from "../../lib/format";

interface AboutProps {
  about: SiteContent["about"];
  experience: SiteContent["experience"]["items"];
  helpLabel: string;
  lang: string;
}

/** Compact duration for a stat: "10 anos" when exact-ish, "2a 5m" otherwise. */
function statDuration(months: number, lang: string) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const pt = lang.startsWith("pt");
  if (rest === 0 || years >= 5) return pt ? `${years} anos` : `${years} yrs`;
  return pt ? `${years}a ${rest}m` : `${years}y ${rest}m`;
}

export function About({ about, experience, helpLabel, lang }: AboutProps) {
  const valueOf = (stat: SiteContent["about"]["stats"][number]) => {
    if (stat.compute === "experience") return statDuration(workedMonths(experience), lang);
    if (stat.compute === "leadership") return statDuration(workedMonths(experience.filter((i) => i.leadership)), lang);
    return stat.value ?? "";
  };

  const textRef = useReveal<HTMLDivElement>(0);
  const statsRef = useReveal<HTMLDListElement>(1);

  return (
    <section className="relative scroll-mt-16 py-16 md:py-24" id="sobre">
      <div className="container-shell">
        <div className="grid gap-6 pt-6 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="label-mono md:sticky md:top-24 md:self-start">{about.eyebrow}</div>
          <div className="min-w-0">
            <div className="reveal max-w-[680px]" ref={textRef}>
              <h2 className="mb-6 [font-family:var(--font-heading)] text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-tight tracking-[-0.015em]">
                {about.heading}
              </h2>
              <div className="space-y-4 text-[1.05rem] leading-relaxed text-text-muted [&_strong]:font-semibold [&_strong]:text-text-main">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                ))}
              </div>
            </div>
            <dl
              className="reveal mt-12 grid max-w-[680px] grid-cols-1 divide-y divide-border-subtle border-y border-border-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0"
              ref={statsRef}
            >
              {about.stats.map((stat) => (
                <div className="py-4 sm:px-5 sm:first:pl-0" key={stat.label}>
                  <dt className="flex items-center gap-2">
                    <span className="[font-family:var(--font-mono)] text-[1.7rem] font-medium leading-none text-accent">{valueOf(stat)}</span>
                    <HelpTip text={stat.help} label={`${helpLabel}: ${stat.label}`} />
                  </dt>
                  <dd className="mt-2 text-sm text-text-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
