import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";

interface AboutProps {
  about: SiteContent["about"];
}

export function About({ about }: AboutProps) {
  const headRevealRef = useReveal<HTMLDivElement>(0);
  const statsRevealRef = useReveal<HTMLDivElement>(1);

  return (
    <section className="relative py-20 md:py-28" id="sobre">
      <div className="container-shell">
        <div className="grid gap-8 md:grid-cols-[1.15fr_.85fr] md:gap-10">
          <div className="reveal" ref={headRevealRef}>
            <div className="eyebrow">{about.eyebrow}</div>
            <h2 className="mb-3 [font-family:var(--font-heading)] text-[clamp(1.6rem,3vw,2.2rem)] font-bold">
              {about.heading}
            </h2>
            <div className="space-y-3 text-text-muted">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
              ))}
            </div>
          </div>
          <div className="reveal grid gap-3 sm:grid-cols-2" ref={statsRevealRef}>
            {about.stats.map((stat) => (
              <div className="rounded-2xl border border-border-subtle bg-surface p-5" key={`${stat.value}-${stat.label}`}>
                <div className="mb-1 [font-family:var(--font-heading)] text-2xl font-bold text-violet-glow">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
