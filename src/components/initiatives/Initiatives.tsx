import type { InitiativeItem, SiteContent } from "../../types/content";
import { useCascade } from "../../hooks/useFx";
import { Section } from "../shared/SectionHead";
import { formatMonth } from "../../lib/format";
import { useCountUp } from "../../hooks/useFx";

function CountUp({ text }: { text: string }) {
  const ref = useCountUp<HTMLElement>(text);
  return (
    <dt ref={ref} className="[font-family:var(--font-mono)] text-[1.7rem] font-medium leading-none text-text-main tabular-nums">
      {text}
    </dt>
  );
}

interface InitiativesProps {
  initiatives: SiteContent["initiatives"];
  dates: SiteContent["ui"]["dates"];
}

function InitiativeBlock({ item, dates }: { item: InitiativeItem; dates: SiteContent["ui"]["dates"] }) {
  const ref = useCascade<HTMLDivElement>("h3, li, dl > div", item.name + item.bullets.length, { stagger: 0.07 });

  return (
    <article className="max-w-[720px]" ref={ref}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[1.05rem] font-semibold text-text-main">{item.role}</h3>
        <span className="[font-family:var(--font-mono)] text-[.8rem] text-text-faint">
          {item.org} · {formatMonth(item.start, dates)} · {item.location} · {item.kind}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {item.bullets.map((bullet) => (
          <li
            key={bullet}
            className="relative pl-4 text-[.98rem] leading-relaxed text-text-muted before:absolute before:left-0 before:top-[0.75em] before:h-px before:w-2 before:bg-text-faint"
          >
            {bullet}
          </li>
        ))}
      </ul>

      <dl className="mt-8 grid grid-cols-3 border-y border-border-subtle">
        {item.facts.map((fact) => (
          <div key={fact.label} className="border-l border-border-subtle py-4 pl-4 first:border-l-0 first:pl-0">
            <CountUp text={fact.value} />
            <dd className="mt-2 text-sm text-text-muted">{fact.label}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function Initiatives({ initiatives, dates }: InitiativesProps) {
  return (
    <Section id="iniciativas" config={initiatives.sectionHead}>
      <div className="flex flex-col gap-16">
        {initiatives.items.map((item) => (
          <InitiativeBlock key={item.name} item={item} dates={dates} />
        ))}
      </div>
    </Section>
  );
}
