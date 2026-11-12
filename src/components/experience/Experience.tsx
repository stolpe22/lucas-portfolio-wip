import { useState } from "react";
import { CareerTimeline } from "./CareerTimeline";
import { MilestonesIcon } from "../shared/icons";
import type { ExperienceItem, SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { Section } from "../shared/SectionHead";
import { formatDuration, formatPeriod, monthsBetween } from "../../lib/format";

interface ExperienceProps {
  experience: SiteContent["experience"];
  ui: SiteContent["ui"]["experience"];
  dates: SiteContent["ui"]["dates"];
  onOpenMilestones: () => void;
}

interface CompanyExperienceGroup {
  company: string;
  location: string;
  current: boolean;
  items: ExperienceItem[];
}

function groupConsecutiveByCompany(items: ExperienceItem[]): CompanyExperienceGroup[] {
  return items.reduce<CompanyExperienceGroup[]>((groups, item) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.company === item.company && lastGroup.location === item.location) {
      lastGroup.items.push(item);
      if (item.end === null) lastGroup.current = true;
      return groups;
    }
    groups.push({ company: item.company, location: item.location, current: item.end === null, items: [item] });
    return groups;
  }, []);
}

interface CompanyBlockProps {
  group: CompanyExperienceGroup;
  index: number;
  ui: SiteContent["ui"]["experience"];
  dates: SiteContent["ui"]["dates"];
}

function CompanyBlock({ group, index, ui, dates }: CompanyBlockProps) {
  const ref = useReveal<HTMLDivElement>(index + 1);
  const first = group.items[group.items.length - 1];
  const last = group.items[0];
  const totalMonths = monthsBetween(first.start, last.end);

  return (
    <div
      className="reveal spotlight grid scroll-mt-24 gap-3 rounded-md border-t border-border-subtle py-8 first:border-t-0 lg:grid-cols-[200px_1fr] lg:gap-8"
      data-company={group.company}
      ref={ref}
    >
      <div>
        <div className="[font-family:var(--font-heading)] text-[1.1rem] font-semibold leading-snug">{group.company}</div>
        <div className="mt-1 text-sm text-text-faint">{group.location}</div>
        {group.items.length > 1 ? (
          <div className="mt-1 [font-family:var(--font-mono)] text-xs text-text-faint">{formatDuration(totalMonths, dates)}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        {group.items.map((item) => (
          <div key={`${item.role}-${item.start}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-[1.02rem] font-semibold text-text-main">{item.role}</h3>
              {item.end === null ? (
                <span className="inline-flex items-center gap-1.5 [font-family:var(--font-mono)] text-[.7rem] uppercase tracking-wider text-status-live">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-live"></span>
                  {ui.liveStatus}
                </span>
              ) : null}
              {item.movement?.promotion ? (
                <span className="rounded-sm bg-accent-soft px-1.5 py-0.5 [font-family:var(--font-mono)] text-[.68rem] uppercase tracking-wider text-accent">
                  ↑ {ui.promotionLabel}
                </span>
              ) : null}
            </div>
            <div className="mt-1 [font-family:var(--font-mono)] text-[.8rem] text-text-faint">
              {formatPeriod(item.start, item.end, dates)} · {formatDuration(monthsBetween(item.start, item.end), dates)}
            </div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {item.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="relative pl-4 text-[.96rem] leading-relaxed text-text-muted before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-text-faint"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Experience({ experience, ui, dates, onOpenMilestones }: ExperienceProps) {
  const [showAll, setShowAll] = useState(false);
  const groups = groupConsecutiveByCompany(experience.items);
  const visible = showAll ? groups : groups.slice(0, experience.previewCount);

  // Clicking a company in the chart jumps to its details (Nielsen #7), expanding the list if needed.
  const goToCompany = (company: string) => {
    const index = groups.findIndex((group) => group.company === company);
    if (index >= experience.previewCount) setShowAll(true);
    requestAnimationFrame(() => {
      document.querySelector(`[data-company="${CSS.escape(company)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <Section id="experiencia" config={experience.sectionHead}>
      <CareerTimeline
        items={experience.items}
        dates={dates}
        caption={ui.timelineCaption}
        ariaLabel={ui.timelineAria}
        onSelect={goToCompany}
      />
      <button
        type="button"
        onClick={onOpenMilestones}
        className="group mb-14 mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-5 text-[.92rem] font-medium text-accent transition-colors hover:bg-accent hover:text-on-accent"
      >
        <MilestonesIcon />
        {ui.openMilestones}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
      </button>
      <div>
        {visible.map((group, index) => (
          <CompanyBlock key={`${group.company}-${index}`} group={group} index={index} ui={ui} dates={dates} />
        ))}
      </div>
      {groups.length > experience.previewCount ? (
        <button
          className="mt-4 inline-flex items-center gap-2 border-b border-border-strong pb-0.5 text-sm font-medium text-text-main transition-colors hover:border-accent hover:text-accent"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? ui.showLessTimeline : ui.showFullTimeline}
          <span aria-hidden="true">{showAll ? "↑" : "↓"}</span>
        </button>
      ) : null}
    </Section>
  );
}
