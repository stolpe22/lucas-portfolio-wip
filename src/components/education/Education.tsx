import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { SectionHead } from "../shared/SectionHead";

interface EducationProps {
  education: SiteContent["education"];
  ui: SiteContent["ui"]["education"];
}

export function Education({ education, ui }: EducationProps) {
  const headRevealRef = useReveal<HTMLDivElement>(0);
  const leftRevealRef = useReveal<HTMLDivElement>(1);
  const rightRevealRef = useReveal<HTMLDivElement>(2);

  return (
    <section className="relative py-20 md:py-28" id="formacao">
      <div className="container-shell">
        <SectionHead config={education.sectionHead} revealRef={headRevealRef} />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="reveal rounded-2xl border border-border-subtle bg-surface p-6" ref={leftRevealRef}>
            <h3 className="mb-4 [font-family:var(--font-heading)] text-lg font-semibold">{ui.academicTitle}</h3>
            <div>
              {education.items.map((item) => (
                <div className="border-t border-border-subtle py-3 first:border-t-0 first:pt-0" key={item.title}>
                  <div className="text-sm font-semibold text-text-main">{item.title}</div>
                  <div className="text-sm text-text-muted">{item.place} - {item.period}</div>
                </div>
              ))}
            </div>
            <div className="h-7"></div>
            <h3 className="mb-4 [font-family:var(--font-heading)] text-lg font-semibold">{ui.languagesTitle}</h3>
            <div>
              {education.languages.map((language) => (
                <div className="border-t border-border-subtle py-3 first:border-t-0 first:pt-0" key={language.name}>
                  <div className="text-sm font-semibold text-text-main">{language.name}</div>
                  <div className="text-sm text-text-muted">{language.level}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal rounded-2xl border border-border-subtle bg-surface p-6" ref={rightRevealRef}>
            <h3 className="mb-4 [font-family:var(--font-heading)] text-lg font-semibold">{ui.certificationsTitle}</h3>
            <div>
              {education.certifications.map((certification) => (
                <div className="flex flex-col gap-1 border-t border-border-subtle py-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between" key={`${certification.title}-${certification.date}`}>
                  <span className="text-sm font-medium text-text-main">{certification.title} - {certification.issuer}</span>
                  <span className="[font-family:var(--font-mono)] text-xs text-text-faint">{certification.date}</span>
                </div>
              ))}
            </div>
            <div className="h-7"></div>
            <h3 className="mb-4 [font-family:var(--font-heading)] text-lg font-semibold">{ui.highlightsTitle}</h3>
            <div>
              {education.highlights.map((highlight) => (
                <div className="border-t border-border-subtle py-3 first:border-t-0 first:pt-0" key={`${highlight.title}-${highlight.detail}`}>
                  <div className="text-sm font-semibold text-text-main">{highlight.title}</div>
                  <div className="text-sm text-text-muted">{highlight.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
