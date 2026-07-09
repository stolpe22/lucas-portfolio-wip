import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = resolve(__dirname, "../src/config/content.json");
const outputPath = resolve(__dirname, "../public/github-repos.json");

const content = JSON.parse(readFileSync(contentPath, "utf8"));
const { username, perPage } = content.github;

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "lucas-portfolio-wip-build-script",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=${perPage}`;
const res = await fetch(url, { headers });

if (!res.ok) {
  throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
}

const repos = await res.json();
writeFileSync(outputPath, JSON.stringify({ fetchedAt: new Date().toISOString(), repos }, null, 2));
console.log(`Wrote ${repos.length} repos to ${outputPath}`);
