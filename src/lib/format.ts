import type { SiteContent, YearMonth } from "../types/content";

type DateLabels = SiteContent["ui"]["dates"];

function parse(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

function currentYearMonth(): YearMonth {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(value: YearMonth, labels: DateLabels): string {
  const { year, month } = parse(value);
  return `${labels.months[month - 1]}/${year}`;
}

export function formatPeriod(start: YearMonth, end: YearMonth | null, labels: DateLabels): string {
  return `${formatMonth(start, labels)} – ${end ? formatMonth(end, labels) : labels.present}`;
}

/** Inclusive month count, the same way LinkedIn counts (Oct–Oct = 1 month). */
export function monthsBetween(start: YearMonth, end: YearMonth | null): number {
  const a = parse(start);
  const b = parse(end ?? currentYearMonth());
  return (b.year - a.year) * 12 + (b.month - a.month) + 1;
}

export function formatDuration(totalMonths: number, labels: DateLabels): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? labels.year : labels.years}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? labels.month : labels.monthsLabel}`);
  return parts.join(labels.and ? ` ${labels.and} ` : " ");
}

export function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function toIndex(value: YearMonth): number {
  const { year, month } = parse(value);
  return year * 12 + (month - 1);
}

/** Months actually worked: union of all periods, so overlaps count once and gaps don't count. */
export function workedMonths(periods: Array<{ start: YearMonth; end: YearMonth | null }>): number {
  const ranges = periods
    .map((p) => [toIndex(p.start), toIndex(p.end ?? currentYearMonth())] as const)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curStart = -1;
  let curEnd = -2;
  for (const [s, e] of ranges) {
    if (s > curEnd + 1) {
      if (curEnd >= curStart && curStart >= 0) total += curEnd - curStart + 1;
      curStart = s;
      curEnd = e;
    } else {
      curEnd = Math.max(curEnd, e);
    }
  }
  if (curStart >= 0) total += curEnd - curStart + 1;
  return total;
}

export function monthIndex(value: YearMonth | null): number {
  return toIndex(value ?? currentYearMonth());
}

/** Compact duration for a headline number: "10 anos" when long or exact, "2a 5m" otherwise. */
export function compactDuration(months: number, lang: string): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const pt = lang.startsWith("pt");
  if (rest === 0 || years >= 5) return pt ? `${years} anos` : `${years} yrs`;
  return pt ? `${years}a ${rest}m` : `${years}y ${rest}m`;
}
