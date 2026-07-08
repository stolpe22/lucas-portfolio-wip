import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { SectionHead } from "../shared/SectionHead";

interface SkillsProps {
  skills: SiteContent["skills"];
}

interface SkillCardProps {
  category: string;
  items: string[];
  index: number;
}

function SkillCard({ category, items, index }: SkillCardProps) {
  const cardRevealRef = useReveal<HTMLDivElement>(index + 1);

  return (
    <div className="reveal rounded-2xl border border-border-subtle bg-surface p-5" ref={cardRevealRef}>
      <h3 className="mb-3 [font-family:var(--font-heading)] text-lg font-semibold">{category}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="rounded-full border border-border-subtle bg-surface-2 px-3 py-1.5 text-xs text-text-muted" key={`${category}-${item}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export function Skills({ skills }: SkillsProps) {
  const headRevealRef = useReveal<HTMLDivElement>(0);

  return (
    <section className="relative py-20 md:py-28" id="skills">
      <div className="container-shell">
        <SectionHead config={skills.sectionHead} revealRef={headRevealRef} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.groups.map((group, index) => (
            <SkillCard
              key={group.category}
              category={group.category}
              items={group.items}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
