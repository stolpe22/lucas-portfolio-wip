import type { SectionHeadConfig } from "../../types/content";
import type { RefObject } from "react";

interface SectionHeadProps {
  config: SectionHeadConfig;
  revealRef?: RefObject<HTMLDivElement | null>;
}

export function SectionHead({ config, revealRef }: SectionHeadProps) {
  return (
    <div className="reveal mb-10 max-w-[640px] md:mb-14" ref={revealRef}>
      <div className="eyebrow">{config.eyebrow}</div>
      <h2 className="[font-family:var(--font-heading)] text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold tracking-[-0.01em]">
        {config.heading}
      </h2>
      {config.subheading ? <p className="mt-3 max-w-[52ch] text-[1.05rem] text-text-muted">{config.subheading}</p> : null}
    </div>
  );
}
