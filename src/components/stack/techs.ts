import {
  siAmazons3,
  siApacheairflow,
  siAwslambda,
  siDbt,
  siDocker,
  siGit,
  siGooglebigquery,
  siGooglecloud,
  siJavascript,
  siMinio,
  siN8n,
  siPandas,
  siPostgresql,
  siPython,
  siReact,
  siTypescript,
} from "simple-icons";

/** A technology for the logo trail: a Simple Icons mark, or a drawn glyph when no mark exists. */
export interface Tech {
  name: string;
  icon?: { path: string; hex: string };
  glyph?: "powerbi" | "api";
}

/** The stack, in the order the trail drops them. Logos: Simple Icons (CC0 paths; marks belong to their owners). */
export const TECHS: Tech[] = [
  { name: "Python", icon: siPython },
  { name: "JavaScript", icon: siJavascript },
  { name: "TypeScript", icon: siTypescript },
  { name: "React", icon: siReact },
  { name: "Power BI", glyph: "powerbi" },
  { name: "dbt", icon: siDbt },
  { name: "Airflow", icon: siApacheairflow },
  { name: "BigQuery", icon: siGooglebigquery },
  { name: "Cloud Run", icon: siGooglecloud },
  { name: "AWS Lambda", icon: siAwslambda },
  { name: "Amazon S3", icon: siAmazons3 },
  { name: "MinIO", icon: siMinio },
  { name: "APIs", glyph: "api" },
  { name: "PostgreSQL", icon: siPostgresql },
  { name: "Docker", icon: siDocker },
  { name: "n8n", icon: siN8n },
  { name: "pandas", icon: siPandas },
  { name: "Git", icon: siGit },
];
