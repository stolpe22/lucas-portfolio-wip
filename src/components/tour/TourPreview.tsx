import { useEffect, useRef } from "react";
import type { SiteContent } from "../../types/content";
import { ServiceArt } from "../services/ServiceArt";
import { TechTile } from "../stack/TechTile";
import { TECHS } from "../stack/techs";
import { gsap } from "../../lib/gsap";
import { monthIndex } from "../../lib/format";

/** Logos dropping inside the preview card while it's open (hover-driven, stops when it closes). */
function MiniRain() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const tiles = Array.from(box.children) as HTMLElement[];
    let i = 0;
    const drop = () => {
      const t = tiles[i++ % tiles.length];
      gsap.killTweensOf(t);
      gsap.set(t, { clearProps: "all" });
      gsap.set(t, { opacity: 1, left: `${10 + Math.random() * 80}%`, top: "35%", xPercent: -50, yPercent: -50 });
      gsap
        .timeline()
        .from(t, { opacity: 0, scale: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" })
        .to(t, { rotation: "random(-300, 300)", duration: 1 }, "<")
        .to(t, { y: 260, ease: "back.in(0.5)", duration: 1 }, 0);
    };
    drop();
    const id = window.setInterval(drop, 170);
    return () => {
      window.clearInterval(id);
      tiles.forEach((t) => gsap.killTweensOf(t));
    };
  }, []);
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {TECHS.map((t) => (
        <div key={t.name} className="absolute scale-[0.7] opacity-0">
          <TechTile tech={t} />
        </div>
      ))}
    </div>
  );
}

function MiniGantt({ items }: { items: SiteContent["experience"]["items"] }) {
  const companies = [...new Set(items.map((i) => i.company))].slice(0, 6);
  const a = Math.min(...items.map((i) => monthIndex(i.start)));
  const b = Math.max(...items.map((i) => monthIndex(i.end))) + 1;
  const pct = (m: number) => ((m - a) / (b - a)) * 100;
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 px-1">
      {companies.map((c) => (
        <div key={c} className="relative h-3 bg-surface-2">
          {items
            .filter((i) => i.company === c)
            .map((i) => (
              <span
                key={i.start}
                className={`absolute inset-y-0 ${i.end === null ? "bg-accent" : "bg-text-main/40"}`}
                style={{ left: `${pct(monthIndex(i.start))}%`, width: `max(3px, ${pct(monthIndex(i.end) + 1) - pct(monthIndex(i.start))}%)` }}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

interface TourPreviewProps {
  id: string;
  content: SiteContent;
}

/** What the floating card shows for each screen. */
export function TourPreview({ id, content }: TourPreviewProps) {
  switch (id) {
    case "stack":
      return <MiniRain />;
    case "servicos":
      return (
        <div className="grid h-full grid-cols-2 place-items-center gap-2 p-2">
          {[0, 1, 2, 3].map((k) => (
            <ServiceArt key={k} kind={k} />
          ))}
        </div>
      );
    case "experiencia":
      return <MiniGantt items={content.experience.items} />;
    case "projetos":
      return (
        <ol className="flex h-full flex-col justify-center gap-2">
          {content.projects.items.map((p, i) => (
            <li key={p.name} className="flex items-baseline gap-3">
              <span className="[font-family:var(--font-display)] text-[1.4rem] font-semibold leading-none text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[.95rem] font-semibold leading-tight">{p.name}</span>
            </li>
          ))}
        </ol>
      );
    case "iniciativas": {
      const facts = (content.initiatives.items[0]?.facts ?? []).slice(0, 3);
      const show = content.initiatives.showcase;
      return (
        <div className="-m-4 flex h-[calc(100%+2rem)] flex-col justify-center gap-4 bg-[#0c0b24] px-5">
          {show ? <img src={`${import.meta.env.BASE_URL}${show.logo}`} alt="" className="h-auto w-[78%]" /> : null}
          <div className="grid grid-cols-3 text-white">
            {facts.map((f) => (
              <div key={f.label}>
                <div className="[font-family:var(--font-display)] text-[1.7rem] font-semibold leading-none text-[#19e6f2]">{f.value}</div>
                <div className="mt-1 text-[.66rem] leading-tight text-white/70">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "formacao": {
      const top = content.education.items[0];
      return (
        <div className="flex h-full flex-col justify-center">
          <span className="tag self-start text-accent">{top?.period.split("·").pop()?.trim()}</span>
          <div className="mt-3 [font-family:var(--font-heading)] text-[1.3rem] font-semibold leading-tight">{top?.title}</div>
          <div className="mt-1 text-[.9rem] text-text-muted">{top?.place}</div>
        </div>
      );
    }
    case "marcos": {
      const ms = content.milestones.items;
      return (
        <div className="flex h-full items-center px-2">
          <div className="relative h-px w-full bg-text-main">
            {ms.map((m, i) => (
              <span
                key={m.date + m.title}
                className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-[1.5px] border-text-main ${i === ms.length - 1 ? "bg-accent" : "bg-surface"}`}
                style={{ left: `${(i / Math.max(1, ms.length - 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>
      );
    }
    case "contato":
      return (
        <div className="flex h-full flex-col justify-center gap-2">
          <div className="[font-family:var(--font-heading)] text-[1.15rem] font-semibold text-accent">{content.contact.email}</div>
          <div className="[font-family:var(--font-mono)] text-[.85rem] text-text-muted">{content.contact.phone}</div>
        </div>
      );
    default:
      return null;
  }
}
