import type { SiteContent } from "../../types/content";
import type { GithubRepo } from "../../types/github";
import { useReveal } from "../../hooks/useReveal";
import { SectionHead } from "../shared/SectionHead";
import { ArrowUpRightIcon } from "../shared/icons";

interface ProjectsProps {
  projects: SiteContent["projects"];
  repos: GithubRepo[];
  ui: SiteContent["ui"]["projects"];
}

interface ProjectCardProps {
  project: SiteContent["projects"]["items"][number];
  repos: GithubRepo[];
  index: number;
  ui: SiteContent["ui"]["projects"];
}

function ProjectCard({ project, repos, index, ui }: ProjectCardProps) {
  const cardRevealRef = useReveal<HTMLDivElement>(index + 1);
  const match = repos.find((repo) => {
    const haystack = `${repo.name} ${repo.description || ""}`.toLowerCase();
    return project.matchKeywords.some((keyword) => haystack.includes(keyword));
  });
  const visibilityLabel = project.visibility === "public" ? ui.publicLabel : ui.privateLabel;

  return (
    <div className="reveal flex flex-col rounded-3xl border border-border-subtle bg-surface p-6 transition hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_24px_50px_-28px_rgba(80,50,180,.45)]" ref={cardRevealRef}>
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-blue to-purple text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
      </div>
      <h3 className="[font-family:var(--font-heading)] text-[1.08rem] font-semibold">{project.name}</h3>
      <div className="mt-1 flex items-center gap-2">
        <div className="[font-family:var(--font-mono)] text-[.78rem] text-violet-glow">{project.subtitle}</div>
        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${project.visibility === "public" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>{visibilityLabel}</span>
      </div>
      <p className="mt-3 flex-1 text-[.95rem] text-text-muted">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((tech) => (
          <span className="rounded-full border border-border-subtle bg-surface-2 px-3 py-1.5 text-xs text-text-muted" key={`${project.name}-${tech}`}>{tech}</span>
        ))}
      </div>
      {project.visibility === "public" && match ? (
        <a className="group mt-4 inline-flex items-center gap-1.5 [font-family:var(--font-heading)] text-[.85rem] font-semibold text-violet-glow" href={match.html_url} target="_blank" rel="noopener">
          {ui.viewCode} <ArrowUpRightIcon />
        </a>
      ) : null}
    </div>
  );
}

export function Projects({ projects, repos, ui }: ProjectsProps) {
  const headRevealRef = useReveal<HTMLDivElement>(0);

  return (
    <section className="relative py-20 md:py-28" id="projetos">
      <div className="container-shell">
        <SectionHead config={projects.sectionHead} revealRef={headRevealRef} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.items.map((project, index) => (
            <ProjectCard key={project.name} project={project} repos={repos} index={index} ui={ui} />
          ))}
        </div>
      </div>
    </section>
  );
}
