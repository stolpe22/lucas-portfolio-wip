import type { ReactNode } from "react";
import type { SectionHeadConfig } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";

interface SectionProps {
  id: string;
  config: SectionHeadConfig;
  children: ReactNode;
  /** Extra classes for the outer <section>. */
  className?: string;
  /** Hide the top hairline (e.g. when the previous block already draws one). */
  noRule?: boolean;
}

/**
 * Editorial section layout: a hairline rule on top, the section label in a narrow
 * left column (sticky on desktop) and the heading + content on the right.
 */
export function Section({ id, config, children, className = "", noRule = false }: SectionProps) {
  const headRef = useReveal<HTMLDivElement>(0);

  return (
    <section id={id} className={`relative scroll-mt-16 py-16 md:py-24 ${className}`}>
      <div className="container-shell">
        <div className={`grid gap-6 pt-6 md:grid-cols-[180px_1fr] md:gap-10 ${noRule ? "" : "border-t border-border-strong"}`}>
          <div className="label-mono md:sticky md:top-24 md:self-start">{config.eyebrow}</div>
          <div className="min-w-0">
            <div className="reveal mb-10 max-w-[680px]" ref={headRef}>
              <h2 className="[font-family:var(--font-heading)] text-[clamp(1.6rem,3.2vw,2.3rem)] font-semibold leading-tight tracking-[-0.015em]">
                {config.heading}
              </h2>
              {config.subheading ? <p className="mt-2 text-[1.02rem] text-text-muted">{config.subheading}</p> : null}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
