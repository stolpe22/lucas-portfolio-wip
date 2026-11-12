import type { ReactNode } from "react";
import type { SiteContent } from "../../types/content";
import { useCascade } from "../../hooks/useFx";
import { Section } from "../shared/SectionHead";

interface EducationProps {
  education: SiteContent["education"];
  ui: SiteContent["ui"]["education"];
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="label-mono mb-3">{title}</h3>
      <ul className="border-t border-border-subtle">{children}</ul>
    </div>
  );
}

function Row({ primary, secondary, aside }: { primary: string; secondary?: string; aside?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-border-subtle py-3">
      <div className="min-w-0">
        <div className="text-[.95rem] font-medium text-text-main">{primary}</div>
        {secondary ? <div className="text-sm text-text-muted">{secondary}</div> : null}
      </div>
      {aside ? <div className="shrink-0 [font-family:var(--font-mono)] text-xs text-text-faint">{aside}</div> : null}
    </li>
  );
}

export function Education({ education, ui }: EducationProps) {
  const key = education.items.map((i) => i.title).join("|");
  const leftRef = useCascade<HTMLDivElement>("h3, li", key, { stagger: 0.05 });
  const rightRef = useCascade<HTMLDivElement>("h3, li", key, { stagger: 0.04 });

  return (
    <Section id="formacao" config={education.sectionHead}>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-10" ref={leftRef}>
          <Group title={ui.academicTitle}>
            {education.items.map((item) => (
              <Row key={item.title} primary={item.title} secondary={`${item.place} · ${item.period}`} />
            ))}
          </Group>
          <Group title={ui.highlightsTitle}>
            {education.highlights.map((highlight) => (
              <Row key={highlight.detail} primary={highlight.title} secondary={highlight.detail} />
            ))}
          </Group>
          <Group title={ui.languagesTitle}>
            {education.languages.map((language) => (
              <Row key={language.name} primary={language.name} secondary={language.level} />
            ))}
          </Group>
        </div>
        <div ref={rightRef}>
          <Group title={ui.certificationsTitle}>
            {education.certifications.map((certification) => (
              <Row
                key={`${certification.title}-${certification.date}`}
                primary={certification.title}
                secondary={certification.issuer}
                aside={certification.date}
              />
            ))}
          </Group>
        </div>
      </div>
    </Section>
  );
}
