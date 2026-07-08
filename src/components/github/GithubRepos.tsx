import { useMemo, useState } from "react";
import type { SiteContent } from "../../types/content";
import type { GithubRepo } from "../../types/github";
import { useReveal } from "../../hooks/useReveal";
import { SectionHead } from "../shared/SectionHead";
import { SearchIcon } from "../shared/icons";

type GithubStatus = "idle" | "loading" | "success" | "error";

interface GithubReposProps {
  github: SiteContent["github"];
  repos: GithubRepo[];
  status: GithubStatus;
  ui: SiteContent["ui"]["github"];
}

interface RepoCardProps {
  repo: GithubRepo;
  index: number;
}

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C#": "#178600",
  Java: "#b07219",
  PHP: "#4F5D95",
  Vue: "#41b883",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
  SCSS: "#c6538c",
  Go: "#00ADD8",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#f34b7d",
};

function langColor(lang: string) {
  return LANG_COLORS[lang] || "#8B5CF6";
}

function RepoCard({ repo, index, ui }: RepoCardProps & { ui: SiteContent["ui"]["github"] }) {
  const cardRevealRef = useReveal<HTMLDivElement>(index + 2);

  return (
    <div className="reveal flex flex-col rounded-2xl border border-border-subtle bg-surface p-5 transition hover:-translate-y-1 hover:border-violet-glow" ref={cardRevealRef}>
      <a className="flex items-center gap-2 [font-family:var(--font-heading)] text-[.98rem] font-semibold" href={repo.html_url} target="_blank" rel="noopener">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[15px] w-[15px] shrink-0 text-text-faint">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z" />
        </svg>
        <span>{repo.name}</span>
      </a>
      <p className="mt-3 flex-1 text-[.92rem] text-text-muted">{repo.description || ui.noDescription}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 [font-family:var(--font-mono)] text-[.78rem] text-text-faint">
        {repo.language ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: langColor(repo.language) }}></span>
            {repo.language}
          </span>
        ) : null}
        <span className="stat">★ {repo.stargazers_count}</span>
        <span className="stat">⑂ {repo.forks_count}</span>
      </div>
    </div>
  );
}

export function GithubRepos({ github, repos, status, ui }: GithubReposProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "stars" | "name">("updated");

  const headRevealRef = useReveal<HTMLDivElement>(0);
  const controlsRevealRef = useReveal<HTMLDivElement>(1);

  const filteredRepos = useMemo(() => {
    let list = [...repos];
    const q = search.toLowerCase().trim();

    if (q) {
      list = list.filter((repo) =>
        repo.name.toLowerCase().includes(q) ||
        (repo.description || "").toLowerCase().includes(q) ||
        (repo.language || "").toLowerCase().includes(q),
      );
    }

    if (sort === "stars") {
      list.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return list;
  }, [repos, search, sort]);

  return (
    <section className="relative py-20 md:py-28" id="repos">
      <div className="container-shell">
        <SectionHead config={github.sectionHead} revealRef={headRevealRef} />

        <div className="reveal mb-6 flex flex-wrap items-center gap-3" ref={controlsRevealRef}>
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2">
            <SearchIcon />
            <input
              type="text"
              placeholder={ui.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border-none bg-transparent text-[.92rem] text-text-main outline-none placeholder:text-text-faint"
            />
          </label>

          <select className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-[.88rem]" value={sort} onChange={(event) => setSort(event.target.value as "updated" | "stars" | "name") }>
            <option value="updated">{ui.sortUpdated}</option>
            <option value="stars">{ui.sortStars}</option>
            <option value="name">{ui.sortName}</option>
          </select>

          <span className="[font-family:var(--font-mono)] text-[.78rem] text-text-faint">{status === "success" ? `${repos.length} ${repos.length === 1 ? ui.repoCountSingular : ui.repoCountPlural}` : ""}</span>
        </div>

        <div className="grid min-h-[120px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {status === "loading" || status === "idle" ? (
            Array.from({ length: 6 }).map((_, index) => <div className="h-[172px] animate-pulse rounded-2xl border border-border-subtle bg-surface" key={`skel-${index}`}></div>)
          ) : null}

          {status === "error" ? (
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 text-text-muted md:col-span-2 xl:col-span-3">
              {ui.loadingError}
              <br />
              {ui.directProfileLabel} <a href={`https://github.com/${github.username}`} target="_blank" rel="noopener" className="text-violet-glow underline">github.com/{github.username}</a>.
            </div>
          ) : null}

          {status === "success" && filteredRepos.length === 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 text-text-muted md:col-span-2 xl:col-span-3">{ui.emptyResults}</div>
          ) : null}

          {status === "success"
            ? filteredRepos.map((repo, index) => (
                <RepoCard key={repo.html_url} repo={repo} index={index} ui={ui} />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
