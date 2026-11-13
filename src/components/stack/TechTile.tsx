import type { Tech } from "./techs";

function Glyph({ tech }: { tech: Tech }) {
  if (tech.icon) {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
        <path d={tech.icon.path} fill={`#${tech.icon.hex}`} />
      </svg>
    );
  }
  if (tech.glyph === "powerbi") {
    // Drawn mark (no official icon available): three rising bars in Power BI yellow.
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
        <rect x="3" y="12" width="5" height="10" rx="1" fill="#F2C811" opacity="0.6" />
        <rect x="9.5" y="7" width="5" height="15" rx="1" fill="#F2C811" opacity="0.8" />
        <rect x="16" y="2" width="5" height="20" rx="1" fill="#F2C811" />
      </svg>
    );
  }
  return (
    <span className="[font-family:var(--font-mono)] text-[1.35rem] font-semibold leading-none text-accent" aria-hidden="true">
      {"{ }"}
    </span>
  );
}

/** Square ink-bordered tile with the logo and its name. */
export function TechTile({ tech, className = "" }: { tech: Tech; className?: string }) {
  return (
    <div
      className={`flex h-[78px] w-[78px] flex-col items-center justify-center gap-1.5 border-[1.5px] border-text-main bg-surface shadow-[3px_3px_0_var(--text)] ${className}`}
      role="img"
      aria-label={tech.name}
    >
      <Glyph tech={tech} />
      <span className="max-w-[70px] truncate [font-family:var(--font-mono)] text-[.58rem] uppercase tracking-wide text-text-muted">{tech.name}</span>
    </div>
  );
}
