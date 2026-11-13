import { useRef } from "react";
import type { SiteContent } from "../../types/content";
import type { GithubRepo } from "../../types/github";
import { Section } from "../shared/SectionHead";
import { ArrowUpRightIcon } from "../shared/icons";
import { gsap, MOTION_OK, ScrollTrigger, SplitText, unclipMasks, useGSAP } from "../../lib/gsap";

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
  const match = repos.find((repo) => {
    const haystack = `${repo.name} ${repo.description || ""}`.toLowerCase();
    return project.matchKeywords.some((keyword) => haystack.includes(keyword));
  });
  const isPublic = project.visibility === "public";

  return (
    <article
      data-project
      className="spotlight group grid gap-3 border-b border-border-subtle py-10 md:grid-cols-[96px_1fr] md:gap-6 md:px-3"
    >
      <div
        data-project-num
        className="[font-family:var(--font-display)] text-[3rem] font-semibold leading-none text-accent/20 transition-colors duration-500 group-hover:text-accent md:text-[4rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div data-project-body>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 data-project-title className="[font-family:var(--font-heading)] text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight">
            {project.name}
          </h3>
          <span
            className={`[font-family:var(--font-mono)] text-[.7rem] uppercase tracking-wider ${
              isPublic ? "text-status-live" : "text-text-faint"
            }`}
          >
            {isPublic ? ui.publicLabel : ui.privateLabel}
          </span>
        </div>
        <div className="mt-1 text-[.98rem] text-text-faint">{project.subtitle}</div>
        <p className="mt-3 max-w-[64ch] text-[1rem] leading-relaxed text-text-muted">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              data-tech
              className="tag text-text-muted transition-colors group-hover:text-text-main"
            >
              {t}
            </span>
          ))}
        </div>
        {isPublic && match ? (
          <a
            className="group/link mt-5 inline-flex items-center gap-1.5 text-[.9rem] font-medium text-accent link-underline"
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

/**
 * Personal projects. Each row is revealed by a mask that sweeps left to right as it scrolls in;
 * the big number slides up, the title rises letter by letter and the tech tags pop in.
 */
export function Projects({ projects, repos, ui }: ProjectsProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, (ctx) => {
        const splits: SplitText[] = [];
        let cancelled = false;
        // Split titles once the fonts are in (character widths depend on them).
        document.fonts.ready.then(() => {
          if (cancelled) return;
          // Inside the matchMedia context, so these tweens are reverted with it.
          ctx.add(() => build());
          ScrollTrigger.refresh();
        });
        const build = () => gsap.utils.toArray<HTMLElement>("[data-project]", listRef.current).forEach((row) => {
          const title = row.querySelector<HTMLElement>("[data-project-title]");
          const split = title ? unclipMasks(SplitText.create(title, { type: "chars", mask: "chars" })) : null;
          if (split) splits.push(split);
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 82%", once: true } });
          tl.from(row.querySelector("[data-project-body]"), { clipPath: "inset(0% 100% 0% 0%)", duration: 1.1, ease: "expo.inOut" })
            .from(row.querySelector("[data-project-num]"), { yPercent: 60, autoAlpha: 0, duration: 0.8, ease: "power3.out" }, 0.1)
            .from(split?.chars ?? [], { yPercent: 110, duration: 0.7, ease: "power4.out", stagger: 0.015 }, 0.35)
            .from(row.querySelectorAll("[data-tech]"), { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "back.out(2)", stagger: 0.04 }, 0.7);
        });
        return () => {
          cancelled = true;
          splits.forEach((s) => s.revert());
        };
      });
      return () => mm.revert();
    },
    { scope: listRef, dependencies: [projects.items.map((p) => p.name).join("|")], revertOnUpdate: true },
  );

  return (
    <Section id="projetos" config={projects.sectionHead}>
      <div ref={listRef}>
        {projects.items.map((project, index) => (
          <ProjectRow key={project.name} project={project} repos={repos} index={index} ui={ui} />
        ))}
      </div>
    </Section>
  );
}
