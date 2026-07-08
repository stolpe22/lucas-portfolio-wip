import { useState } from "react";
import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { SectionHead } from "../shared/SectionHead";

interface ExperienceProps {
  experience: SiteContent["experience"];
  ui: SiteContent["ui"]["experience"];
}

type ExperienceItem = SiteContent["experience"]["items"][number];

interface CompanyExperienceGroup {
  company: string;
  location: string;
  current: boolean;
  items: ExperienceItem[];
}

interface TimelineItemProps {
  group: CompanyExperienceGroup;
  index: number;
  ui: SiteContent["ui"]["experience"];
}

function PromotionIcon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-[18px] w-[18px] items-center justify-center animate-[promo-glow_2s_ease-in-out_infinite]"
      style={{ filter: "drop-shadow(0 0 6px rgba(94, 200, 255, 0.8)) drop-shadow(0 0 10px rgba(159, 123, 255, 0.55))" }}
      aria-label={label}
      title={label}
      role="img"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full">
        <defs>
          <linearGradient id="promotionUp" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5ec8ff" />
            <stop offset="100%" stopColor="#9f7bff" />
          </linearGradient>
        </defs>
        <path d="M12 4l6 7h-3v9h-6v-9H6l6-7Z" fill="url(#promotionUp)" />
      </svg>
    </span>
  );
}

function groupConsecutiveByCompany(items: ExperienceItem[]): CompanyExperienceGroup[] {
  return items.reduce<CompanyExperienceGroup[]>((groups, item) => {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.company === item.company && lastGroup.location === item.location) {
      lastGroup.items.push(item);
      if (item.current) {
        lastGroup.current = true;
      }
      return groups;
    }

    groups.push({
      company: item.company,
      location: item.location,
      current: item.current,
      items: [item],
    });

    return groups;
  }, []);
}

function TimelineItem({ group, index, ui }: TimelineItemProps) {
  const itemRevealRef = useReveal<HTMLDivElement>(index + 1);

  return (
    <div className="reveal relative pb-10 last:pb-0" ref={itemRevealRef}>
      <div
        className="absolute -left-[34px] top-1 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-blue-glow to-violet-glow"
        style={{ boxShadow: group.current ? "0 0 0 4px var(--bg), 0 0 0 5px var(--status-live)" : "0 0 0 4px var(--bg), 0 0 0 5px var(--border)" }}
      >
        {group.current ? (
          <span className="absolute inset-[-6px] rounded-full border-2 border-status-live animate-[pulse-ring_1.8s_ease-out_infinite]"></span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <div className="[font-family:var(--font-heading)] text-[1.1rem] font-bold">{group.company}</div>
          {group.current ? (
            <div className="inline-flex items-center gap-1.5 [font-family:var(--font-mono)] text-[.72rem] text-status-live">
              <span className="h-1.5 w-1.5 rounded-full bg-status-live animate-[blink_1.6s_ease-in-out_infinite]"></span>
              {ui.liveStatus}
            </div>
          ) : null}
        </div>
        <div className="mb-3 [font-family:var(--font-mono)] text-[.82rem] text-text-faint">{group.location}</div>

        <div className="flex flex-col gap-3">
          {group.items.map((item) => (
            <div className="border-t border-dashed border-border-subtle pt-3 first:border-t-0 first:pt-0" key={`${item.company}-${item.role}-${item.period}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.movement?.promotion ? <PromotionIcon label={ui.promotionLabel} /> : null}
                  <div className="[font-family:var(--font-heading)] text-[1.02rem] font-semibold">{item.role}</div>
                </div>
                <div className="[font-family:var(--font-mono)] text-[.79rem] text-text-faint">{item.period}</div>
              </div>
              <ul className="flex flex-col gap-2">
                {item.bullets.map((bullet) => (
                  <li key={`${item.role}-${bullet}`} className="relative pl-4 text-[.95rem] text-text-muted before:absolute before:left-0 before:top-0 before:content-['›'] before:text-violet-glow before:[font-family:var(--font-mono)]">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Experience({ experience, ui }: ExperienceProps) {
  const [showAll, setShowAll] = useState(false);
  const headRevealRef = useReveal<HTMLDivElement>(0);
  const groupedItems = groupConsecutiveByCompany(experience.items);
  const visibleGroups = showAll
    ? groupedItems
    : groupedItems.slice(0, experience.previewCount);

  return (
    <section className="relative py-20 md:py-28" id="experiencia">
      <div className="container-shell">
        <SectionHead config={experience.sectionHead} revealRef={headRevealRef} />
        <div>
          <div className="relative ml-1 pl-8 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:bg-[repeating-linear-gradient(to_bottom,var(--blue-glow)_0_6px,transparent_6px_14px)] before:[background-size:2px_28px]">
            {visibleGroups.map((group) => {
              const originalIndex = groupedItems.indexOf(group);
              return (
                <TimelineItem
                  key={`${group.company}-${group.location}-${originalIndex}`}
                  group={group}
                  index={originalIndex}
                  ui={ui}
                />
              );
            })}
          </div>
          {groupedItems.length > experience.previewCount ? (
            <div className="mt-3">
              <button className="inline-flex items-center rounded-full border border-border-strong px-4 py-2 [font-family:var(--font-heading)] text-[.82rem] font-semibold transition hover:-translate-y-0.5 hover:border-violet-glow hover:bg-[var(--grad-soft)]" onClick={() => setShowAll((value) => !value)}>
                {showAll ? ui.showLessTimeline : ui.showFullTimeline}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
