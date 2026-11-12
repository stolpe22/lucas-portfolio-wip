import { useRef, useState } from "react";
import { CareerTimeline } from "./CareerTimeline";
import { MilestonesIcon } from "../shared/icons";
import type { ExperienceItem, SiteContent } from "../../types/content";
import { Section } from "../shared/SectionHead";
import { formatDuration, formatPeriod, monthIndex, monthsBetween } from "../../lib/format";
import { flowTop, gsap, MOTION_OK, NAV_OFFSET, ScrollTrigger, scrollToY, useGSAP } from "../../lib/gsap";

interface ExperienceProps {
  experience: SiteContent["experience"];
  ui: SiteContent["ui"]["experience"];
  dates: SiteContent["ui"]["dates"];
  onOpenMilestones: () => void;
}

interface CompanyExperienceGroup {
  company: string;
  location: string;
  items: ExperienceItem[];
}

const VISIBLE_BULLETS = 3;
const STACK_TOP = NAV_OFFSET + 24;

function groupConsecutiveByCompany(items: ExperienceItem[]): CompanyExperienceGroup[] {
  return items.reduce<CompanyExperienceGroup[]>((groups, item) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.company === item.company && lastGroup.location === item.location) {
      lastGroup.items.push(item);
      return groups;
    }
    groups.push({ company: item.company, location: item.location, items: [item] });
    return groups;
  }, []);
}

/**
 * Small multiple (Tufte): the whole career on one true-scale axis, this card's roles in the
 * brand color, every other job in gray. Same axis on every card, so they compare at a glance.
 */
function MiniTimeline({ all, mine, dates }: { all: ExperienceItem[]; mine: ExperienceItem[]; dates: SiteContent["ui"]["dates"] }) {
  const starts = all.map((i) => monthIndex(i.start));
  const ends = all.map((i) => monthIndex(i.end) + 1);
  const firstYear = Math.floor(Math.min(...starts) / 12);
  const lastYear = Math.floor((Math.max(...ends) - 1) / 12) + 1;
  const a = firstYear * 12;
  const span = lastYear * 12 - a;
  const pct = (m: number) => ((m - a) / span) * 100;
  const mineSet = new Set(mine);
  const ticks: number[] = [];
  for (let y = firstYear + (firstYear % 2); y <= lastYear; y += 4) ticks.push(y);

  return (
    <div aria-hidden="true">
      <div className="relative h-2.5 bg-surface-2">
        {all.map((item) => {
          const s = monthIndex(item.start);
          const e = monthIndex(item.end) + 1;
          const isMine = mineSet.has(item);
          return (
            <span
              key={`${item.company}-${item.start}`}
              data-mini={isMine ? "mine" : "other"}
              title={isMine ? `${item.role} · ${formatPeriod(item.start, item.end, dates)}` : undefined}
              className={`absolute inset-y-0 border-r border-surface ${isMine ? "bg-accent" : "bg-border-strong"}`}
              style={{ left: `${pct(s)}%`, width: `max(4px, ${pct(e) - pct(s)}%)` }}
            />
          );
        })}
      </div>
      <div className="relative mt-1 h-4">
        {ticks.map((y) => (
          <span key={y} className="absolute -translate-x-1/2 [font-family:var(--font-mono)] text-[.62rem] text-text-faint" style={{ left: `${pct(y * 12)}%` }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Bullets with progressive disclosure: the first few, then "+N". */
function Bullets({ bullets }: { bullets: string[] }) {
  const [open, setOpen] = useState(false);
  const hidden = bullets.length - VISIBLE_BULLETS;
  const shown = open || hidden <= 0 ? bullets : bullets.slice(0, VISIBLE_BULLETS);
  return (
    <>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {shown.map((bullet) => (
          <li
            key={bullet}
            className="relative pl-4 text-[.94rem] leading-relaxed text-text-muted before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-text-faint"
          >
            {bullet}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            // Card height changes: re-measure the stacking triggers.
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }}
          aria-expanded={open}
          className="mt-2 inline-flex h-7 min-w-7 items-center justify-center border border-text-main px-2 [font-family:var(--font-mono)] text-[.72rem] text-text-main transition-colors hover:bg-text-main hover:text-bg"
        >
          {open ? "−" : `+${hidden}`}
        </button>
      ) : null}
    </>
  );
}

function CompanyCard({
  group,
  all,
  index,
  total,
  ui,
  dates,
}: {
  group: CompanyExperienceGroup;
  all: ExperienceItem[];
  index: number;
  total: number;
  ui: SiteContent["ui"]["experience"];
  dates: SiteContent["ui"]["dates"];
}) {
  const first = group.items[group.items.length - 1];
  const last = group.items[0];
  const current = group.items.some((i) => i.end === null);

  return (
    <article
      data-card
      data-company={group.company}
      className="card-hard relative overflow-hidden p-6 md:p-8"
    >
      {/* Dimming veil, animated as the next card slides over this one. */}
      <div data-veil className="pointer-events-none absolute inset-0 z-10 bg-bg opacity-0" aria-hidden="true"></div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
        <header>
          <div className="flex items-center gap-3 [font-family:var(--font-mono)] text-[.75rem] text-text-faint">
            <span className="text-accent">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            {current ? (
              <span className="tag-now">{ui.liveStatus}</span>
            ) : null}
          </div>
          <h3 data-card-title className="mt-3 [font-family:var(--font-heading)] text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold leading-[1.1]">
            {group.company}
          </h3>
          <div className="mt-2 text-[.9rem] text-text-muted">
            {group.location} · {formatDuration(monthsBetween(first.start, last.end), dates)}
          </div>
          <div className="mt-6">
            <MiniTimeline all={all} mine={group.items} dates={dates} />
          </div>
        </header>

        <div className="flex flex-col gap-6">
          {group.items.map((item) => (
            <div key={`${item.role}-${item.start}`} data-role>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4 className="text-[1.02rem] font-semibold text-text-main">{item.role}</h4>
                {item.movement?.promotion ? (
                  <span className="tag text-accent">
                    ↑ {ui.promotionLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 [font-family:var(--font-mono)] text-[.78rem] text-text-faint">
                {formatPeriod(item.start, item.end, dates)} · {formatDuration(monthsBetween(item.start, item.end), dates)}
              </div>
              <Bullets bullets={item.bullets} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Career: the true-scale overview first, then one big card per company.
 * Desktop: the cards stack — each one pins near the top and the next slides over it,
 * while the one underneath shrinks and dims. Phones: cards rise in one after another.
 */
export function Experience({ experience, ui, dates, onOpenMilestones }: ExperienceProps) {
  const groups = groupConsecutiveByCompany(experience.items);
  const stackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", stackRef.current);
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const lastCard = cards[cards.length - 1];
        cards.forEach((card, i) => {
          // Content of each card animates in as it arrives.
          gsap.from(card.querySelectorAll("[data-card-title], [data-role]"), {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: card, start: "top 80%", once: true },
          });
          gsap.from(card.querySelectorAll('[data-mini="mine"]'), {
            scaleX: 0,
            transformOrigin: "0% 50%",
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 75%", once: true },
          });

          if (card === lastCard) return;
          // Tall cards pin by their bottom so nothing is ever hidden; short ones pin near the top.
          const pinStart = () =>
            card.offsetHeight > window.innerHeight - STACK_TOP - 24 ? "bottom bottom-=24" : `top top+=${STACK_TOP}`;
          ScrollTrigger.create({
            trigger: card,
            start: pinStart,
            endTrigger: lastCard,
            end: `top top+=${STACK_TOP}`,
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
          const next = cards[i + 1];
          gsap.to(card, {
            scale: 0.93,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: `top top+=${STACK_TOP}`, scrub: true },
          });
          gsap.to(card.querySelector("[data-veil]"), {
            opacity: 0.55,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: `top top+=${STACK_TOP}`, scrub: true },
          });
          // Once fully covered it fades out, so a taller card never peeks out under the stack.
          gsap.to(card, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: { trigger: next, start: `top top+=${STACK_TOP + 160}`, end: `top top+=${STACK_TOP}`, scrub: true },
          });
        });
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        cards.forEach((card) => {
          gsap.from(card, { y: 40, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 88%", once: true } });
        });
      });

      return () => mm.revert();
    },
    { scope: stackRef, dependencies: [groups.length], revertOnUpdate: true },
  );

  // Jump by the card's place in the page flow: pinned cards are visually displaced while stacking,
  // so their on-screen position would send the jump to the wrong card.
  const goToCompany = (company: string) => {
    const card = stackRef.current?.querySelector<HTMLElement>(`[data-company="${CSS.escape(company)}"]`);
    if (card) scrollToY(flowTop(card) - STACK_TOP);
  };

  return (
    <Section id="experiencia" config={experience.sectionHead}>
      <CareerTimeline items={experience.items} dates={dates} caption={ui.timelineCaption} ariaLabel={ui.timelineAria} onSelect={goToCompany} />
      <button
        type="button"
        onClick={onOpenMilestones}
        className="btn btn-ghost group mb-14 mt-6"
      >
        <MilestonesIcon />
        {ui.openMilestones}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>

      <div ref={stackRef} className="flex flex-col gap-6 lg:gap-10">
        {groups.map((group, index) => (
          <CompanyCard key={`${group.company}-${index}`} group={group} all={experience.items} index={index} total={groups.length} ui={ui} dates={dates} />
        ))}
      </div>
    </Section>
  );
}
