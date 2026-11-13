import { BrandLogo } from "../shared/BrandLogo";

/**
 * Small illustration per service card (viewBox 160 × 56). Elements are tagged for the card's
 * entrance timeline: [data-art-grow] grows up, [data-art-draw] is drawn, [data-art-pop] pops in,
 * [data-art-type] appears line by line. Without motion it just shows the finished drawing.
 */
export function ServiceArt({ kind }: { kind: number }) {
  const ink = "stroke-text-main";
  return (
    <svg viewBox="0 0 160 56" className="h-14 w-40 overflow-visible text-text-main" aria-hidden="true">
      {kind === 0 ? (
        // Dashboards: bars + trend line.
        <g>
          <line x1="2" y1="52" x2="150" y2="52" className={ink} strokeWidth="1.2" />
          {[0.35, 0.55, 0.42, 0.7, 0.62, 0.9].map((v, i) => (
            <rect
              key={i}
              data-art-grow
              x={6 + i * 24}
              y={52 - v * 40}
              width="16"
              height={v * 40}
              fill={i === 5 ? "var(--accent)" : "var(--border-strong)"}
            />
          ))}
          <path
            data-art-draw
            d={[0.35, 0.55, 0.42, 0.7, 0.62, 0.9].map((v, i) => `${i ? "L" : "M"} ${14 + i * 24} ${52 - v * 40 - 8}`).join(" ")}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
          />
        </g>
      ) : kind === 1 ? (
        // Pipelines: a DAG with Airflow and dbt.
        <g>
          <g fill="none" strokeWidth="1.4" className={ink}>
            <path data-art-draw d="M 18 28 L 48 12" />
            <path data-art-draw d="M 18 28 L 48 44" />
            <path data-art-draw d="M 48 12 L 80 28" />
            <path data-art-draw d="M 48 44 L 80 28" />
            <path data-art-draw d="M 80 28 L 108 28" />
          </g>
          {[
            [18, 28],
            [48, 12],
            [48, 44],
            [80, 28],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} data-art-pop x={x - 7} y={y - 7} width="14" height="14" fill="var(--accent)" className={ink} strokeWidth="1.2" />
          ))}
          <g data-art-pop>
            <BrandLogo name="airflow" x={112} y={6} size={20} />
          </g>
          <g data-art-pop>
            <BrandLogo name="dbt" x={136} y={30} size={20} />
          </g>
        </g>
      ) : kind === 2 ? (
        // APIs: request + JSON answer typing in.
        <g className="[font-family:var(--font-mono)]" fontSize="9.5">
          <rect x="1" y="1" width="156" height="54" className="fill-surface-2" />
          <text data-art-type x="8" y="15" fill="var(--accent)">
            GET /v1/vendas
          </text>
          <text data-art-type x="8" y="29" className="fill-text-muted">
            {"{ \"total\": 1284,"}
          </text>
          <text data-art-type x="8" y="42" className="fill-text-muted" xmlSpace="preserve">
            {"  \"status\": \"ok\" }"}
          </text>
          <rect data-art-pop x="118" y="6" width="34" height="13" fill="var(--text)" />
          <text data-art-pop x="135" y="15.5" textAnchor="middle" fill="var(--bg)" fontSize="8.5">
            200
          </text>
        </g>
      ) : (
        // Automation & AI: n8n → OpenAI → done.
        <g>
          <g fill="none" strokeWidth="1.4" className={ink}>
            <path data-art-draw d="M 38 28 L 62 28" />
            <path data-art-draw d="M 98 28 L 122 28" />
          </g>
          <g data-art-pop>
            <rect x="4" y="11" width="34" height="34" className="fill-surface stroke-text-main" strokeWidth="1.2" />
            <BrandLogo name="n8n" x={10} y={17} size={22} />
          </g>
          <g data-art-pop>
            <rect x="62" y="11" width="36" height="34" className="fill-surface stroke-text-main" strokeWidth="1.2" />
            <BrandLogo name="openai" x={69} y={17} size={22} brand={false} />
          </g>
          <g data-art-pop>
            <rect x="122" y="11" width="34" height="34" fill="var(--accent)" className="stroke-text-main" strokeWidth="1.2" />
            <path d="M 131 28 L 137 34 L 148 22" fill="none" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}
    </svg>
  );
}
