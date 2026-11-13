import type { ReactNode } from "react";

interface RoomFrameProps {
  index: number;
  total: number;
  label: string;
  ui: { home: string; next: string; of: string };
  next: { label: string; href: string } | null;
  children: ReactNode;
}

/**
 * Frame around every screen of the tour: a way home and the position at the top,
 * and a big "Next: …" at the bottom so the visit flows like a guided tour.
 * Links are plain hash anchors; the router in App turns them into screen changes.
 */
export function RoomFrame({ index, total, label, ui, next, children }: RoomFrameProps) {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <div className="container-shell mb-6 flex items-center justify-between gap-4 md:mb-10">
        <a href="#" className="btn btn-ghost btn-sm">
          <span aria-hidden="true">←</span> {ui.home}
        </a>
        <span className="[font-family:var(--font-mono)] text-[.8rem] text-text-muted">
          <span className="text-text-main">{String(index + 1).padStart(2, "0")}</span> {ui.of} {String(total).padStart(2, "0")} ·{" "}
          <span className="uppercase tracking-wider">{label}</span>
        </span>
      </div>

      {children}

      {next ? (
        <div className="container-shell pb-16 pt-6 md:pb-24">
          <a
            href={next.href}
            className="group flex items-end justify-between gap-6 border-t-[1.5px] border-text-main pt-6 transition-colors hover:text-accent"
          >
            <span>
              <span className="label-mono block">{ui.next}</span>
              <span className="mt-2 block [font-family:var(--font-display)] text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-none">
                {next.label}
              </span>
            </span>
            <span className="mb-2 text-[clamp(2rem,5vw,4rem)] leading-none transition-transform duration-300 group-hover:translate-x-3" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
