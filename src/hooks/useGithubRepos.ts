import { useEffect, useRef, useState } from "react";
import type { GithubRepo } from "../types/github";

type GithubStatus = "idle" | "loading" | "success" | "error";

const DEFAULT_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useGithubRepos(username: string, perPage: number, excludeForks: boolean) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [status, setStatus] = useState<GithubStatus>("idle");
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    let isActive = true;
    let intervalId: number | undefined;

    async function loadRepos() {
      if (!hasLoadedOnceRef.current) {
        setStatus("loading");
      }

      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          throw new Error(`GitHub API error ${res.status}`);
        }
        const data = (await res.json()) as GithubRepo[];

        if (!isActive) {
          return;
        }

        setRepos(excludeForks ? data.filter((repo) => !repo.fork) : data);
        setStatus("success");
        hasLoadedOnceRef.current = true;
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (!hasLoadedOnceRef.current) {
          setStatus("error");
          return;
        }

        console.error("Failed to refresh GitHub repositories", error);
      }
    }

    void loadRepos();

    const refreshOnFocus = () => {
      void loadRepos();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadRepos();
      }
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadRepos();
      }
    }, DEFAULT_REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }

      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [username, perPage, excludeForks]);

  return { repos, status };
}
