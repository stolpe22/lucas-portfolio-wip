import type { SiteContent } from "../../types/content";
import type { GithubRepo } from "../../types/github";
import { useReveal } from "../../hooks/useReveal";
import { Section } from "../shared/SectionHead";
import { ArrowUpRightIcon } from "../shared/icons";

interface ProjectsProps {
  projects: SiteContent["projects"];
  repos: GithubRepo[];
  ui: SiteContent["ui"]["projects"];
}

interface ProjectRowProps {
  project: SiteContent["projects"]["items"][number];
  repos: GithubRepo[];
  index: number;
  ui: SiteContent["ui"]["projects"];
}

function ProjectRow({ project, repos, index, ui }: ProjectRowProps) {
  const ref = useReveal<HTMLElement>(index + 1);
  const match = repos.find((repo) => {
    const haystack = `${repo.name} ${repo.description || ""}`.toLowerCase();
    return project.matchKeywords.some((keyword) => haystack.includes(keyword));
  });
  const isPublic = project.visibility === "public";

  return (
    <article
      className="reveal spotlight grid gap-3 rounded-md border-b border-border-subtle py-8 md:grid-cols-[48px_1fr] md:gap-4 md:px-3"
      ref={ref}
    >
      <div className="[font-family:var(--font-mono)] text-sm text-text-faint">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="[font-family:var(--font-heading)] text-[1.2rem] font-semibold">{project.name}</h3>
          <span
            className={`[font-family:var(--font-mono)] text-[.7rem] uppercase tracking-wider ${
              isPublic ? "text-status-live" : "text-text-faint"
            }`}
          >
            {isPublic ? ui.publicLabel : ui.privateLabel}
          </span>
        </div>
        <div className="mt-0.5 text-[.95rem] text-text-faint">{project.subtitle}</div>
        <p className="mt-3 max-w-[64ch] text-[.98rem] leading-relaxed text-text-muted">{project.description}</p>
        <div className="mt-4 [font-family:var(--font-mono)] text-[.78rem] text-text-faint">{project.tech.join("  ·  ")}</div>
        {isPublic && match ? (
          <a
            className="group mt-4 inline-flex items-center gap-1.5 text-[.9rem] font-medium text-accent link-underline"
            href={match.html_url}
            target="_blank"
            rel="noopener"
          >
            {ui.viewCode} <ArrowUpRightIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function Projects({ projects, repos, ui }: ProjectsProps) {
  return (
    <Section id="projetos" config={projects.sectionHead}>
      <div>
        {projects.items.map((project, index) => (
          <ProjectRow key={project.name} project={project} repos={repos} index={index} ui={ui} />
        ))}
      </div>
    </Section>
  );
}
