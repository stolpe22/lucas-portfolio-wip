// Generates the résumé PDFs from the built site (dist/), one per language.
//
// The résumé is a React component rendered from the same content JSON as the site
// (src/components/resume/Resume.tsx). It only shows up in print, so printing the
// page with headless Chrome yields the résumé. The files land in dist/ next to the
// site, and the "Download résumé" button links to them.
//
// Runs after `vite build`. Needs Google Chrome or Chromium: set CHROME_PATH, or it
// tries the usual install locations. Without a browser it fails in CI and only warns locally.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { preview } from "vite";

// Async on purpose: a sync call would block the event loop and the in-process preview
// server could not answer Chrome (deadlock).
const run = promisify(execFile);

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const PORT = 4179;

const languages = [
  { code: "pt", content: "src/config/content.json" },
  { code: "en", content: "src/config/content.en.json" },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
  ];
  return candidates.find((path) => path && existsSync(path));
}

const chrome = findChrome();
if (!chrome) {
  const message = "[resume] Chrome/Chromium not found (set CHROME_PATH). Résumé PDFs were not generated.";
  if (process.env.CI) {
    console.error(message);
    process.exit(1);
  }
  console.warn(message);
  process.exit(0);
}

const server = await preview({ root, logLevel: "silent", preview: { port: PORT, strictPort: true } });
const base = server.resolvedUrls?.local[0] ?? `http://localhost:${PORT}/`;
const profile = mkdtempSync(join(tmpdir(), "resume-chrome-"));

try {
  for (const { code, content } of languages) {
    const { resume } = JSON.parse(readFileSync(join(root, content), "utf8"));
    const output = join(dist, `${resume.fileName}.pdf`);

    await run(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=10000",
        `--user-data-dir=${profile}`,
        `--print-to-pdf=${output}`,
        `${base}?lang=${code}`,
      ],
      { timeout: 90_000 },
    );

    if (!existsSync(output) || statSync(output).size < 10_000) {
      throw new Error(`[resume] ${output} was not generated correctly`);
    }
    console.log(`[resume] ${code}: dist/${resume.fileName}.pdf (${Math.round(statSync(output).size / 1024)} KB)`);
  }
} finally {
  await server.close();
  rmSync(profile, { recursive: true, force: true });
}
