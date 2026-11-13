import { siApacheairflow, siDbt, siDocker, siGooglecloud, siGooglesheets, siN8n, siOpenai, siPostgresql, siPython } from "simple-icons";

/** Tool logos from Simple Icons (SVG paths are CC0; the marks belong to their owners). */
const ICONS = {
  airflow: siApacheairflow,
  dbt: siDbt,
  docker: siDocker,
  gcp: siGooglecloud,
  sheets: siGooglesheets,
  n8n: siN8n,
  openai: siOpenai,
  postgres: siPostgresql,
  python: siPython,
} as const;

export type BrandName = keyof typeof ICONS;

interface BrandLogoProps {
  name: BrandName;
  /** Position/size inside a parent <svg> (logos are drawn on a 24×24 grid). */
  x: number;
  y: number;
  size: number;
  /** Use the brand color, or inherit `currentColor`. */
  brand?: boolean;
}

/** Renders a tool logo inside an SVG scene. */
export function BrandLogo({ name, x, y, size, brand = true }: BrandLogoProps) {
  const icon = ICONS[name];
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`} aria-label={icon.title} role="img">
      <title>{icon.title}</title>
      <path d={icon.path} fill={brand ? `#${icon.hex}` : "currentColor"} />
    </g>
  );
}
