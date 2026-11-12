import { useMemo, useState } from "react";
import type { SiteContent } from "../../types/content";
import type { GithubRepo } from "../../types/github";
import { useReveal } from "../../hooks/useReveal";
import { useMoreBelow } from "../../hooks/useMoreBelow";
import { Section } from "../shared/SectionHead";
import { SearchIcon } from "../shared/icons";

type GithubStatus = "idle" | "loading" | "success" | "error";
type SortKey = "updated" | "stars" | "name";

interface GithubReposProps {
  github: SiteContent["github"];
  repos: GithubRepo[];
  status: GithubStatus;
  syncedAt: string | null;
  ui: SiteContent["ui"]["github"];
  dates: SiteContent["ui"]["dates"];
  locale: string;
}

const NO_LANGUAGE = "__none__";

function monthYear(iso: string, dates: SiteContent["ui"]["dates"]) {
  const d = new Date(iso);
  return `${dates.months[d.getMonth()].toLowerCase()}/${d.getFullYear()}`;
}

function Chip({ label, onRemove, removeLabel }: { label: string; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="inline-flex items-center gap-1 border border-text-main bg-surface py-0.5 pl-2.5 pr-1 text-[.8rem] text-text-main">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${label}`}
        className="inline-flex h-6 w-6 items-center justify-center text-text-faint hover:bg-text-main hover:text-bg"
      >
        ×
      </button>
    </span>
  );
}

export function GithubRepos({ github, repos, status, syncedAt, ui, dates, locale }: GithubReposProps) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("updated");
  const controlsRef = useReveal<HTMLDivElement>(1);

  const langLabel = (key: string) => (key === NO_LANGUAGE ? ui.noLanguage : key);

  // Language options with counts (Nielsen #5: no empty choice by surprise). Counts follow the search.
  const searched = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return repos;
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(q) ||
        (repo.description || "").toLowerCase().includes(q) ||
        (repo.language || "").toLowerCase().includes(q),
    );
  }, [repos, search]);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((repo) => counts.set(repo.language ?? NO_LANGUAGE, 0));
    searched.forEach((repo) => {
      const key = repo.language ?? NO_LANGUAGE;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    // Most common first, "no language" last.
    return [...counts.entries()].sort((a, b) =>
      a[0] === NO_LANGUAGE ? 1 : b[0] === NO_LANGUAGE ? -1 : b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [repos, searched]);

  const visible = useMemo(() => {
    const list = searched.filter((repo) => !language || (repo.language ?? NO_LANGUAGE) === language);
    if (sort === "stars") list.sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return list;
  }, [searched, language, sort]);

  const showStars = repos.some((repo) => repo.stargazers_count > 0);
  const hasFilters = Boolean(search.trim() || language);
  const clearAll = () => {
    setSearch("");
    setLanguage(null);
  };

  const { ref: listRef, count: moreBelow } = useMoreBelow<HTMLDivElement>([visible.length, status]);

  const syncedLabel = syncedAt
    ? new Date(syncedAt).toLocaleString(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const columns = showStars ? "sm:grid-cols-[1fr_9rem_3.5rem_5.5rem]" : "sm:grid-cols-[1fr_9rem_5.5rem]";

  return (
    <Section id="repos" config={github.sectionHead}>
      <div className="reveal" ref={controlsRef}>
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-h-11 flex-1 items-center gap-2 border-[1.5px] border-text-main bg-surface px-3 shadow-[3px_3px_0_var(--text)] focus-within:shadow-[5px_5px_0_var(--accent)]">
            <SearchIcon />
            <input
              type="search"
              placeholder={ui.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Escape" && setSearch("")}
              aria-label={ui.searchPlaceholder}
              className="w-full border-none bg-transparent py-2 text-base text-text-main outline-none placeholder:text-text-faint sm:text-[.92rem]"
            />
          </label>
          <select
            className="min-h-11 border-[1.5px] border-text-main bg-surface px-3 text-[.9rem] shadow-[3px_3px_0_var(--text)]"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label={ui.sortLabel}
          >
            <option value="updated">{ui.sortUpdated}</option>
            {showStars ? <option value="stars">{ui.sortStars}</option> : null}
            <option value="name">{ui.sortName}</option>
          </select>
        </div>

        {/* Language filter pills: category + filters the list; click again to remove (pill rule). */}
        {status === "success" ? (
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={ui.languagesLabel}>
            {languages.map(([key, count]) => {
              const active = language === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  disabled={count === 0 && !active}
                  onClick={() => setLanguage(active ? null : key)}
                  className={`inline-flex min-h-9 items-center gap-1.5 border px-3 text-[.8rem] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? "border-text-main bg-text-main text-bg"
                      : "border-text-main/40 bg-surface text-text-muted hover:border-text-main hover:text-text-main"
                  }`}
                >
                  {langLabel(key)}
                  <span className={`[font-family:var(--font-mono)] text-[.72rem] ${active ? "" : "text-text-faint"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* "Viewing now" status bar (Nielsen #1, #3, #6). */}
        {status === "success" ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border-subtle py-2.5 text-[.82rem] text-text-muted">
            <span>
              {ui.showing} <b className="[font-family:var(--font-mono)] font-medium text-text-main">{visible.length}</b> {ui.of}{" "}
              <span className="[font-family:var(--font-mono)]">{repos.length}</span> {repos.length === 1 ? ui.repoCountSingular : ui.repoCountPlural}
            </span>
            {search.trim() ? (
              <Chip label={`${ui.searchChip}: “${search.trim()}”`} onRemove={() => setSearch("")} removeLabel={ui.removeFilter} />
            ) : null}
            {language ? <Chip label={langLabel(language)} onRemove={() => setLanguage(null)} removeLabel={ui.removeFilter} /> : null}
            {hasFilters ? (
              <button type="button" onClick={clearAll} className="text-accent underline-offset-2 hover:underline">
                {ui.clearAll}
              </button>
            ) : null}
            {syncedLabel ? (
              <span className="w-full [font-family:var(--font-mono)] text-[.72rem] text-text-faint sm:ml-auto sm:w-auto">
                {ui.syncedLabel} {syncedLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* List: fixed height, header stays put, "+k below" when rows are out of view. */}
      <div className="relative mt-1">
        <div ref={listRef} className="max-h-[460px] overflow-y-auto overscroll-contain">
          <div
            className={`sticky top-0 z-10 hidden gap-4 border-b border-border-strong bg-bg py-2 label-mono sm:grid ${columns}`}
            role="presentation"
          >
            <span>{ui.colName}</span>
            <span>{ui.colLanguage}</span>
            {showStars ? <span className="text-right">★</span> : null}
            <span className="text-right">{ui.colUpdated}</span>
          </div>

          {status === "loading" || status === "idle"
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse border-b border-border-subtle bg-surface/60" />
              ))
            : null}

          {status === "error" ? (
            <p className="py-6 text-text-muted">
              {ui.loadingError} {ui.directProfileLabel}{" "}
              <a href={`https://github.com/${github.username}`} target="_blank" rel="noopener" className="text-accent underline">
                github.com/{github.username}
              </a>
              .
            </p>
          ) : null}

          {status === "success" && visible.length === 0 ? (
            <div className="py-8 text-text-muted">
              <p>{ui.emptyResults}</p>
              <button
                type="button"
                onClick={clearAll}
                className="btn btn-ghost btn-sm mt-3"
              >
                {ui.clearFilters}
              </button>
            </div>
          ) : null}

          {status === "success"
            ? visible.map((repo) => (
                <a
                  key={repo.html_url}
                  data-row
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener"
                  className={`group grid gap-x-4 gap-y-0.5 border-b border-border-subtle py-3 transition-colors hover:bg-surface-2 sm:items-baseline ${columns}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate [font-family:var(--font-mono)] text-[.9rem] font-medium text-text-main group-hover:text-accent">
                      {repo.name}
                    </span>
                    <span className="block truncate text-[.84rem] text-text-muted" title={repo.description || undefined}>
                      {repo.description || ui.noDescription}
                    </span>
                  </span>
                  {/* Mobile: meta on one line under the name. */}
                  <span className="[font-family:var(--font-mono)] text-[.75rem] text-text-faint sm:text-[.8rem] sm:text-text-muted">
                    {repo.language ?? "—"}
                    <span className="sm:hidden">
                      {showStars ? ` · ★ ${repo.stargazers_count}` : ""} · {monthYear(repo.updated_at, dates)}
                    </span>
                  </span>
                  {showStars ? (
                    <span className="hidden text-right [font-family:var(--font-mono)] text-[.8rem] text-text-muted sm:block">
                      {repo.stargazers_count}
                    </span>
                  ) : null}
                  <span className="hidden text-right [font-family:var(--font-mono)] text-[.8rem] text-text-muted sm:block">
                    {monthYear(repo.updated_at, dates)}
                  </span>
                </a>
              ))
            : null}
        </div>

        {moreBelow > 0 ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-gradient-to-t from-bg to-transparent pb-2"
            aria-live="polite"
          >
            <span className="border border-text-main bg-bg px-3 py-0.5 [font-family:var(--font-mono)] text-[.72rem] text-text-main">
              +{moreBelow} {ui.moreBelow}
            </span>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
