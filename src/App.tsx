import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { localizedContent } from "./config/content";
import { useTheme } from "./hooks/useTheme";
import { useGithubRepos } from "./hooks/useGithubRepos";
import { useLanguage } from "./hooks/useLanguage";
import { useTypedKeyword } from "./hooks/useTypedKeyword";
import { usePointerLight } from "./hooks/usePointerLight";
import { useScrollProgress } from "./hooks/useFx";
import { Nav } from "./components/nav/Nav";
import { Hero } from "./components/hero/Hero";
import { DiceNavigator } from "./components/dice/DiceNavigator";
import { About } from "./components/about/About";
import { Experience } from "./components/experience/Experience";
import { Initiatives } from "./components/initiatives/Initiatives";
import { Projects } from "./components/projects/Projects";
import { GithubRepos } from "./components/github/GithubRepos";
import { Education } from "./components/education/Education";
import { Contact } from "./components/contact/Contact";
import { Footer } from "./components/footer/Footer";
import { EasterEggModal } from "./components/shared/EasterEggModal";
import { Resume } from "./components/resume/Resume";
import { Milestones } from "./components/milestones/Milestones";
import { Services } from "./components/services/Services";
import { SmoothScroller } from "./components/fx/SmoothScroller";
import { StackRoom } from "./components/stack/StackRoom";
import { TECHS } from "./components/stack/techs";
import { TourMenu } from "./components/tour/TourMenu";
import { RoomFrame } from "./components/tour/RoomFrame";
import { useTourRouter } from "./hooks/useTourRouter";
import { compactDuration, workedMonths } from "./lib/format";

const CURTAIN_STRIPS = [0, 1, 2, 3, 4, 5];

function App() {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const content = localizedContent[language];
  const { toggleTheme } = useTheme(content.theme.default);
  const { repos, status, syncedAt } = useGithubRepos(
    content.github.username,
    content.github.perPage,
    content.github.excludeForks,
  );
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useTypedKeyword(content.ui.easterEgg.keyword, () => setShowEasterEgg(true));
  usePointerLight();
  const progressRef = useScrollProgress<HTMLDivElement>();

  useEffect(() => {
    document.documentElement.lang = content.meta.lang;
    document.title = content.meta.title;

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", content.meta.description);
    }

    const faviconLink = document.getElementById("favicon");
    if (faviconLink) {
      faviconLink.setAttribute("href", content.meta.favicon);
    }
  }, [content.meta]);

  // The résumé PDFs are generated at build time from this same content
  // (scripts/build-resume.mjs) and served next to the site, so the button is a plain download.
  // In dev there is no PDF yet, so it falls back to printing the page (the résumé is the
  // only thing visible in print).
  const downloadResume = useCallback(() => {
    const fileName = content.resume.fileName;
    if (import.meta.env.DEV) {
      const previousTitle = document.title;
      const restore = () => {
        document.title = previousTitle;
        window.removeEventListener("afterprint", restore);
      };
      window.addEventListener("afterprint", restore);
      document.title = fileName;
      window.print();
      return;
    }
    const link = document.createElement("a");
    link.href = `${import.meta.env.BASE_URL}${fileName}.pdf`;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [content.resume.fileName]);

  const currentJobs = content.experience.items.filter((item) => item.end === null);

  // Milestones view lives at #marcos and is tied to browser history,
  // so the back button (or swipe-back on phones) returns to the profile.
  const MILESTONES_HASH = "#marcos";
  const [milestonesOpen, setMilestonesOpen] = useState(() => window.location.hash === MILESTONES_HASH);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onPop = () => setMilestonesOpen(window.location.hash === MILESTONES_HASH);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openMilestones = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    window.history.pushState({ milestones: true }, "", MILESTONES_HASH);
    setMilestonesOpen(true);
  }, []);

  const closeMilestones = useCallback(() => {
    if (window.history.state?.milestones) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setMilestonesOpen(false);
    }
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  // ---- Tour: one screen at a time (ids = nav hrefs), home = hero + typographic menu.
  const screens = content.nav.map((n) => ({ id: n.href.slice(1), label: n.label }));
  const screenIds = screens.map((s) => s.id).join("|");
  const ids = useMemo(() => screenIds.split("|"), [screenIds]);
  const labelFor = useCallback(
    (id: string | null) => (id ? (screens.find((s) => s.id === id)?.label ?? "") : content.brand.wordmarkAlt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [screenIds, content.brand.wordmarkAlt],
  );
  const onOverlay = useCallback((id: string) => id === "marcos" && openMilestones(), [openMilestones]);
  const { view, navigate, curtainRef, labelRef, indexRef } = useTourRouter({ ids, labelFor, onOverlay });

  // Milestones is an overlay but sits in the tour order: its "next" closes it and opens the following screen.
  const afterMilestones = screens[ids.indexOf("marcos") + 1];
  const milestonesNext = afterMilestones
    ? {
        eyebrow: content.ui.tour.next,
        label: afterMilestones.label,
        onGo: () => {
          // The #marcos entry becomes the screen it was opened from, so "back" from the next screen returns there.
          window.history.replaceState(view ? { room: view } : null, "", view ? `#${view}` : window.location.pathname + window.location.search);
          setMilestonesOpen(false);
          navigate(afterMilestones.id);
        },
      }
    : undefined;

  // Hints on the home menu, filled from the data ("{n}").
  const hintN: Record<string, string | number> = {
    servicos: content.services.items.length,
    experiencia: compactDuration(workedMonths(content.experience.items), content.meta.lang),
    stack: TECHS.length,
    projetos: content.projects.items.length,
    marcos: content.milestones.items.length,
  };
  const tourItems = screens.map((s) => ({
    id: s.id,
    label: s.label,
    hint: (content.tour.hints[s.id] ?? "").replace("{n}", String(hintN[s.id] ?? "")),
  }));

  const renderScreen = (id: string) => {
    switch (id) {
      case "servicos":
        return <Services services={content.services} ui={content.ui.services} />;
      case "experiencia":
        return (
          <>
            <About about={content.about} experience={content.experience.items} helpLabel={content.ui.help.label} lang={content.meta.lang} />
            <Experience experience={content.experience} ui={content.ui.experience} dates={content.ui.dates} onOpenMilestones={openMilestones} />
          </>
        );
      case "stack":
        return <StackRoom skills={content.skills} ui={content.ui.tour} />;
      case "projetos":
        return (
          <>
            <Projects projects={content.projects} repos={repos} ui={content.ui.projects} />
            <GithubRepos github={content.github} repos={repos} status={status} syncedAt={syncedAt} ui={content.ui.github} dates={content.ui.dates} locale={content.meta.lang} />
          </>
        );
      case "iniciativas":
        return <Initiatives initiatives={content.initiatives} dates={content.ui.dates} />;
      case "formacao":
        return <Education education={content.education} ui={content.ui.education} />;
      case "contato":
        return <Contact contact={content.contact} ui={content.ui.contact} onDownloadResume={downloadResume} />;
      default:
        return null;
    }
  };
  const viewIndex = view ? screens.findIndex((s) => s.id === view) : -1;
  const nextScreen = viewIndex >= 0 && viewIndex < screens.length - 1 ? screens[viewIndex + 1] : null;

  return (
    <>
      <div className="print:hidden">
        {/* Must come first: creates the smoother before the sections' ScrollTriggers. */}
        <SmoothScroller />
        <div className="page-glow" aria-hidden="true"></div>
        <div ref={progressRef} className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left scale-x-0 bg-accent" aria-hidden="true"></div>
        {showEasterEgg ? (
          <EasterEggModal content={content.ui.easterEgg} onClose={() => setShowEasterEgg(false)} />
        ) : null}
        <Nav
          navItems={content.nav}
          brandLabel={content.brand.label}
          onToggleTheme={toggleTheme}
          language={language}
          onChangeLanguage={setLanguage}
          onToggleLanguage={toggleLanguage}
          onDownloadResume={downloadResume}
          activeHref={view ? `#${view}` : ""}
          ui={content.ui.nav}
        />
        {/* Fixed UI lives outside the smoothed content. */}
        <DiceNavigator navItems={content.nav} ui={content.ui.dice} onNavigate={navigate} />
        <div id="smooth-wrapper">
          <div id="smooth-content">
        <main>
          {view === null ? (
            <>
              <Hero
                hero={content.hero}
                wordmarkAlt={content.brand.wordmarkAlt}
                currentJobs={currentJobs}
                currentLabel={content.ui.experience.liveStatus}
                onDownloadResume={downloadResume}
                onOpenMilestones={openMilestones}
              />
              <TourMenu eyebrow={content.tour.eyebrow} items={tourItems} content={content} />
            </>
          ) : (
            <RoomFrame
              key={view}
              index={viewIndex}
              total={screens.length}
              label={screens[viewIndex]?.label ?? ""}
              ui={content.ui.tour}
              next={nextScreen ? { label: nextScreen.label, href: `#${nextScreen.id}` } : null}
            >
              {renderScreen(view)}
            </RoomFrame>
          )}
        </main>
        <Footer footer={content.footer} ui={content.ui.footer} />
          </div>
        </div>
      </div>

      {/* Screen-change curtain. */}
      <div
        ref={curtainRef}
        className="pointer-events-none fixed inset-0 z-[190] overflow-hidden opacity-0 print:hidden"
        style={{ visibility: "hidden" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex">
          {CURTAIN_STRIPS.map((i) => (
            <div key={i} data-strip="a" className="-mr-px h-full flex-1 bg-accent" />
          ))}
        </div>
        <div className="absolute inset-0 flex">
          {CURTAIN_STRIPS.map((i) => (
            <div key={i} data-strip="b" className="-mr-px h-full flex-1 bg-[#101012]" />
          ))}
        </div>
        <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
          <span ref={indexRef} className="mb-5 [font-family:var(--font-mono)] text-[.8rem] tracking-[0.2em] text-[#f5f2eb]/60"></span>
          <span
            ref={labelRef}
            className="block [font-family:var(--font-display)] text-[clamp(3rem,11vw,9.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.03em] text-[#f5f2eb]"
          ></span>
          <span data-bar className="mt-6 block h-[5px] w-[min(240px,40vw)] bg-accent-bright" />
        </div>
      </div>

      {milestonesOpen ? (
        <Milestones
          data={content.milestones}
          experience={content.experience.items}
          ui={content.ui.milestones}
          dates={content.ui.dates}
          onClose={closeMilestones}
          next={milestonesNext}
        />
      ) : null}

      <div className="hidden print:block" aria-hidden="true">
        <Resume content={content} />
      </div>
    </>
  );
}

export default App;
