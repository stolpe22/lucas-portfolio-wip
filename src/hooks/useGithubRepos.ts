import { useEffect, useState } from "react";
import type { GithubRepo } from "../types/github";

type GithubStatus = "idle" | "loading" | "success" | "error";

export function useGithubRepos(username: string, perPage: number, excludeForks: boolean) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [status, setStatus] = useState<GithubStatus>("idle");

  useEffect(() => {
    async function loadRepos() {
      setStatus("loading");
      try {
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`,
        );
        if (!res.ok) {
          throw new Error(`GitHub API error ${res.status}`);
        }
        const data = (await res.json()) as GithubRepo[];
        setRepos(excludeForks ? data.filter((repo) => !repo.fork) : data);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    void loadRepos();
  }, [username, perPage, excludeForks]);

  return { repos, status };
}
