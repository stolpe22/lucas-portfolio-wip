import { useCallback, useEffect, useRef, useState } from "react";
import { localizedContent } from "./config/content";
import { useTheme } from "./hooks/useTheme";
import { useGithubRepos } from "./hooks/useGithubRepos";
import { useLanguage } from "./hooks/useLanguage";
import { useTypedKeyword } from "./hooks/useTypedKeyword";
import { usePointerLight } from "./hooks/usePointerLight";
import { Nav } from "./components/nav/Nav";
import { Hero } from "./components/hero/Hero";
import { DiceNavigator } from "./components/dice/DiceNavigator";
import { About } from "./components/about/About";
import { Skills } from "./components/skills/Skills";
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

  return (
    <>
      <div className="print:hidden">
        <div className="page-glow" aria-hidden="true"></div>
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
          ui={content.ui.nav}
        />
        <main>
          <Hero
            hero={content.hero}
            wordmarkAlt={content.brand.wordmarkAlt}
            currentJobs={currentJobs}
            currentLabel={content.ui.experience.liveStatus}
            onDownloadResume={downloadResume}
            onOpenMilestones={openMilestones}
          />
          <DiceNavigator navItems={content.nav} ui={content.ui.dice} />
          <About about={content.about} experience={content.experience.items} helpLabel={content.ui.help.label} lang={content.meta.lang} />
          <Experience
            experience={content.experience}
            ui={content.ui.experience}
            dates={content.ui.dates}
            onOpenMilestones={openMilestones}
          />
          <Initiatives initiatives={content.initiatives} dates={content.ui.dates} />
          <Skills skills={content.skills} />
          <Projects projects={content.projects} repos={repos} ui={content.ui.projects} />
          <GithubRepos
            github={content.github}
            repos={repos}
            status={status}
            syncedAt={syncedAt}
            ui={content.ui.github}
            dates={content.ui.dates}
            locale={content.meta.lang}
          />
          <Education education={content.education} ui={content.ui.education} />
          <Contact contact={content.contact} ui={content.ui.contact} onDownloadResume={downloadResume} />
        </main>
        <Footer footer={content.footer} ui={content.ui.footer} />
      </div>

      {milestonesOpen ? (
        <Milestones
          data={content.milestones}
          experience={content.experience.items}
          ui={content.ui.milestones}
          dates={content.ui.dates}
          onClose={closeMilestones}
        />
      ) : null}

      <div className="hidden print:block" aria-hidden="true">
        <Resume content={content} />
      </div>
    </>
  );
}

export default App;
