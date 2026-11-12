import type { ExperienceItem, SiteContent } from "../../types/content";
import { formatDuration, formatPeriod, monthIndex, workedMonths } from "../../lib/format";

interface CareerTimelineProps {
  items: ExperienceItem[];
  dates: SiteContent["ui"]["dates"];
  caption: string;
  ariaLabel: string;
  onSelect: (company: string) => void;
}

interface Row {
  company: string;
  items: ExperienceItem[];
  lastEnd: number;
}

const GRID = "grid grid-cols-[7.5rem_1fr] gap-x-3 sm:grid-cols-[11rem_1fr_8.5rem] sm:gap-x-4";

/**
 * Career on a true time scale (Tufte: lie factor ≈ 1). One row per company, one bar per role,
 * gaps between jobs stay visible, total time written next to each row (direct labels).
 * Brand color = highlight (current job); a light tint of it = ordinary data; gray = axis.
 */
export function CareerTimeline({ items, dates, caption, ariaLabel, onSelect }: CareerTimelineProps) {
  const rows = Object.values(
    items.reduce<Record<string, Row>>((acc, item) => {
      const row = (acc[item.company] ??= { company: item.company, items: [], lastEnd: 0 });
      row.items.push(item);
      row.lastEnd = Math.max(row.lastEnd, monthIndex(item.end));
      return acc;
    }, {}),
  ).sort((a, b) => b.lastEnd - a.lastEnd);

  const firstYear = Math.floor(Math.min(...items.map((i) => monthIndex(i.start))) / 12);
  const lastYear = Math.floor(Math.max(...rows.map((r) => r.lastEnd)) / 12) + 1;
  const axisStart = firstYear * 12;
  const span = lastYear * 12 - axisStart;
  const pct = (month: number) => ((month - axisStart) / span) * 100;

  const ticks: number[] = [];
  for (let y = firstYear + (firstYear % 2); y <= lastYear; y += 2) ticks.push(y);

  return (
    <figure aria-label={ariaLabel}>
      <div className="flex flex-col">
        {rows.map((row) => (
          <button
            key={row.company}
            type="button"
            onClick={() => onSelect(row.company)}
            className={`group ${GRID} items-center rounded-sm py-2 text-left transition-colors hover:bg-surface-2`}
          >
            <span className="min-w-0 pl-1">
              <span className="block truncate text-[.85rem] font-medium text-text-main group-hover:text-accent" title={row.company}>
                {row.company}
              </span>
              <span className="block whitespace-nowrap [font-family:var(--font-mono)] text-[.68rem] text-text-faint sm:hidden">
                {formatDuration(workedMonths(row.items), dates)}
              </span>
            </span>
            <span className="relative h-3">
              {row.items.map((item) => {
                const start = monthIndex(item.start);
                const end = monthIndex(item.end) + 1; // inclusive end month
                return (
                  <span
                    key={item.start}
                    title={`${item.role} · ${formatPeriod(item.start, item.end, dates)}`}
                    className={`absolute inset-y-0 rounded-[2px] border-r-2 border-bg ${item.end === null ? "bg-accent" : "bg-accent/35"}`}
                    style={{ left: `${pct(start)}%`, width: `max(4px, ${pct(end) - pct(start)}%)` }}
                  />
                );
              })}
            </span>
            <span className="hidden whitespace-nowrap text-right [font-family:var(--font-mono)] text-[.75rem] text-text-muted sm:block">
              {formatDuration(workedMonths(row.items), dates)}
            </span>
          </button>
        ))}
      </div>

      {/* Axis: round years, gray, no grid lines. */}
      <div className={GRID} aria-hidden="true">
        <span />
        <span className="relative mt-1 h-6 border-t border-border-strong">
          {ticks.map((year, index) => (
            <span
              key={year}
              className={`absolute top-1 -translate-x-1/2 [font-family:var(--font-mono)] text-[.68rem] text-text-faint ${
                index % 2 === 1 ? "hidden sm:inline" : ""
              }`}
              style={{ left: `${pct(year * 12)}%` }}
            >
              {year}
            </span>
          ))}
        </span>
      </div>
      <figcaption className="mt-2 text-[.8rem] text-text-faint">{caption}</figcaption>
    </figure>
  );
}
