import type { ExperienceItem, SiteContent } from "../../types/content";
import { DownloadIcon, MilestonesIcon } from "../shared/icons";

interface HeroProps {
  hero: SiteContent["hero"];
  wordmarkAlt: string;
  currentJobs: ExperienceItem[];
  currentLabel: string;
  onDownloadResume: () => void;
  onOpenMilestones: () => void;
}

function resolvePublicSrc(src: string | undefined) {
  if (!src) return src;
  return src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;
}

const RISE_IN = "opacity-0 animate-[rise-in_.7s_ease-out_forwards]";
const delay = (value: string) => ({ animationDelay: value });

export function Hero({ hero, wordmarkAlt, currentJobs, currentLabel, onDownloadResume, onOpenMilestones }: HeroProps) {
  const photoSrc = resolvePublicSrc(hero.photo);

  const photoClasses =
    "mx-auto w-full max-w-[300px] object-contain md:max-w-[360px]";

  return (
    <section className="relative isolate overflow-hidden pt-24 md:pt-36" data-light-area>
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="dot-grid"></div>
        <div className="dot-grid-lit"></div>
      </div>
      <div className="container-shell">
        <div className="grid items-end gap-8 border-b border-border-strong md:grid-cols-[1.25fr_.75fr] md:gap-6">
          <div className="pb-8 md:pb-20">
            <div className={`label-mono mb-4 md:mb-6 ${RISE_IN}`} style={delay(".05s")}>{hero.eyebrow}</div>
            <h1
              className={`mb-3 [font-family:var(--font-display)] text-[clamp(2.8rem,8.5vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.01em] text-text-main ${RISE_IN}`} style={delay(".15s")}
            >
              {wordmarkAlt}
            </h1>
            <p className={`mb-6 text-[clamp(1.1rem,2.2vw,1.4rem)] font-medium text-accent ${RISE_IN}`} style={delay(".25s")}>{hero.role}</p>
            <p className={`mb-8 max-w-[56ch] text-[1.05rem] leading-relaxed text-text-muted ${RISE_IN}`} style={delay(".35s")}>{hero.description}</p>

            <div className={`flex flex-wrap items-center gap-3 ${RISE_IN}`} style={delay(".45s")}>
              {hero.ctas.map((cta) => {
                const classes = `inline-flex items-center gap-2 whitespace-nowrap rounded-md px-5 py-2.5 text-[.95rem] font-medium transition-colors ${
                  cta.style === "primary"
                    ? "bg-accent text-on-accent hover:bg-text-main hover:text-bg"
                    : "border border-border-strong text-text-main hover:border-text-main"
                }`;
                if (cta.action) {
                  const isResume = cta.action === "resume";
                  return (
                    <button
                      key={cta.label}
                      type="button"
                      onClick={isResume ? onDownloadResume : onOpenMilestones}
                      className={classes}
                    >
                      {isResume ? <DownloadIcon /> : <MilestonesIcon />}
                      {cta.label}
                    </button>
                  );
                }
                return (
                  <a key={cta.label} href={cta.href} className={classes}>
                    {cta.label}
                  </a>
                );
              })}
            </div>

            {currentJobs.length ? (
              <div className={`mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 md:mt-10 text-sm text-text-muted ${RISE_IN}`} style={delay(".55s")}>
                <span className="h-2 w-2 rounded-full bg-status-live animate-[blink_2.4s_ease-in-out_infinite]"></span>
                <span className="label-mono !text-status-live">{currentLabel}</span>
                {currentJobs.map((job, i) => (
                  <span key={`${job.company}-${job.start}`}>
                    {i > 0 ? <span className="mr-2 text-text-faint">·</span> : null}
                    {job.role}, {job.company}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {photoSrc ? (
            <div className="relative mx-auto w-[200px] self-end sm:w-[240px] md:w-full">
              <div className="absolute inset-x-[6%] bottom-0 top-[14%] -z-10 rounded-t-full bg-accent-soft"></div>
              <img
                src={photoSrc}
                alt={hero.photoAlt || ""}
                className={`relative ${photoClasses} ${RISE_IN}`}
                style={delay(".2s")}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
