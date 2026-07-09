import { useEffect, useState } from "react";
import type { GithubRepo } from "../types/github";

type GithubStatus = "idle" | "loading" | "success" | "error";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;
const CACHE_KEY = "ls-github-repos-cache";

interface CachedRepos {
  username: string;
  perPage: number;
  excludeForks: boolean;
  fetchedAt: number;
  repos: GithubRepo[];
}

function readCache(username: string, perPage: number, excludeForks: boolean): CachedRepos | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRepos;
    if (parsed.username !== username || parsed.perPage !== perPage || parsed.excludeForks !== excludeForks) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(entry: CachedRepos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage unavailable (private mode, quota, etc) — cache is best-effort only
  }
}

export function useGithubRepos(username: string, perPage: number, excludeForks: boolean) {
  const [repos, setRepos] = useState<GithubRepo[]>(
    () => readCache(username, perPage, excludeForks)?.repos ?? [],
  );
  const [status, setStatus] = useState<GithubStatus>(() =>
    readCache(username, perPage, excludeForks) ? "success" : "idle",
  );

  useEffect(() => {
    let isActive = true;
    const cached = readCache(username, perPage, excludeForks);
    let lastFetchedAt = cached?.fetchedAt ?? 0;
    let hasData = Boolean(cached);

    async function loadRepos() {
      if (!hasData) {
        setStatus("loading");
      }

      try {
        const res = await fetch(`${import.meta.env.BASE_URL}github-repos.json`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Repos snapshot fetch error ${res.status}`);
        }
        const payload = (await res.json()) as { fetchedAt: string; repos: GithubRepo[] };

        if (!isActive) {
          return;
        }

        const filtered = excludeForks ? payload.repos.filter((repo) => !repo.fork) : payload.repos;
        lastFetchedAt = Date.now();
        hasData = true;
        setRepos(filtered);
        setStatus("success");
        writeCache({ username, perPage, excludeForks, fetchedAt: lastFetchedAt, repos: filtered });
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (!hasData) {
          setStatus("error");
          return;
        }

        console.error("Failed to refresh GitHub repositories, keeping cached data", error);
      }
    }

    const refreshIfStale = () => {
      if (Date.now() - lastFetchedAt >= REFRESH_INTERVAL_MS) {
        void loadRepos();
      }
    };

    refreshIfStale();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshIfStale();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(refreshIfStale, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [username, perPage, excludeForks]);

  return { repos, status };
}
