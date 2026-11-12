import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { Section } from "../shared/SectionHead";

interface SkillsProps {
  skills: SiteContent["skills"];
}

export function Skills({ skills }: SkillsProps) {
  const listRef = useReveal<HTMLDListElement>(1);

  return (
    <Section id="skills" config={skills.sectionHead}>
      <dl className="reveal border-t border-border-subtle" ref={listRef}>
        {skills.groups.map((group) => (
          <div
            key={group.category}
            className="grid gap-1 border-b border-border-subtle py-4 sm:grid-cols-[220px_1fr] sm:gap-6"
          >
            <dt className="text-[.95rem] font-semibold text-text-main">{group.category}</dt>
            <dd className="text-[.95rem] leading-relaxed text-text-muted">
              {group.items.map((item, index) => (
                <span key={item}>
                  {item}
                  {index < group.items.length - 1 ? <span className="mx-2 text-text-faint">/</span> : null}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
