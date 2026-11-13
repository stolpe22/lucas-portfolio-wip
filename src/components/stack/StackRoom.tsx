import type { SiteContent } from "../../types/content";
import { useCascade, useSplitReveal } from "../../hooks/useFx";
import { LogoTrail } from "./LogoTrail";

interface StackRoomProps {
  skills: SiteContent["skills"];
  ui: SiteContent["ui"]["tour"];
}

/** Stack screen: the logo-trail playground, then the skills grouped by area. */
export function StackRoom({ skills, ui }: StackRoomProps) {
  const titleRef = useSplitReveal<HTMLHeadingElement>(skills.sectionHead.heading);
  const listRef = useCascade<HTMLDListElement>(":scope > div", skills.groups.map((g) => g.category).join("|"), { x: -30, y: 0, stagger: 0.07 });

  return (
    <section id="stack" className="relative pb-16 md:pb-24">
      <div className="container-shell">
        <div className="grid gap-6 pt-2 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="label-mono">{skills.sectionHead.eyebrow}</div>
          <div className="mb-8 max-w-[680px]">
            <h2 ref={titleRef} className="[font-family:var(--font-heading)] text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              {skills.sectionHead.heading}
            </h2>
            {skills.sectionHead.subheading ? <p className="mt-3 text-[1.02rem] text-text-muted">{skills.sectionHead.subheading}</p> : null}
          </div>
        </div>
      </div>

      <LogoTrail hint={ui.stackHint} mouseHint={ui.stackMouse} touchHint={ui.stackTouch} />

      <div className="container-shell mt-14">
        <div className="grid gap-6 md:grid-cols-[180px_1fr] md:gap-10">
          <div />
          <dl className="border-t-[1.5px] border-text-main" ref={listRef}>
            {skills.groups.map((group) => (
              <div key={group.category} className="grid gap-1 border-b border-border-subtle py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                <dt className="text-[.95rem] font-semibold text-text-main">{group.category}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span key={item} className="tag text-text-muted">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
