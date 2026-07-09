import { useEffect, useState } from "react";
import { localizedContent } from "./config/content";
import { useTheme } from "./hooks/useTheme";
import { useGithubRepos } from "./hooks/useGithubRepos";
import { useLanguage } from "./hooks/useLanguage";
import { useKonamiCode } from "./hooks/useKonamiCode";
import { Nav } from "./components/nav/Nav";
import { Hero } from "./components/hero/Hero";
import { DiceNavigator, EASTER_EGG_ROLL_EVENT } from "./components/dice/DiceNavigator";
import { About } from "./components/about/About";
import { Skills } from "./components/skills/Skills";
import { Experience } from "./components/experience/Experience";
import { Projects } from "./components/projects/Projects";
import { GithubRepos } from "./components/github/GithubRepos";
import { Education } from "./components/education/Education";
import { Contact } from "./components/contact/Contact";
import { Footer } from "./components/footer/Footer";
import { Confetti } from "./components/shared/Confetti";

function App() {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const content = localizedContent[language];
  const { toggleTheme } = useTheme(content.theme.default);
  const { repos, status } = useGithubRepos(
    content.github.username,
    content.github.perPage,
    content.github.excludeForks,
  );
  const [showConfetti, setShowConfetti] = useState(false);

  useKonamiCode(() => {
    setShowConfetti(true);
    window.dispatchEvent(new CustomEvent(EASTER_EGG_ROLL_EVENT));
    window.setTimeout(() => setShowConfetti(false), 3500);
  });

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

  return (
    <>
      {showConfetti ? <Confetti /> : null}
      <Nav
        navItems={content.nav}
        brandLabel={content.brand.label}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={setLanguage}
        onToggleLanguage={toggleLanguage}
        ui={content.ui.nav}
      />
      <Hero hero={content.hero} wordmarkAlt={content.brand.wordmarkAlt} scrollHint={content.ui.hero.scrollHint} />
      <DiceNavigator navItems={content.nav} ui={content.ui.dice} />
      <About about={content.about} />
      <Experience experience={content.experience} ui={content.ui.experience} />
      <Skills skills={content.skills} />
      <Projects projects={content.projects} repos={repos} ui={content.ui.projects} />
      <GithubRepos github={content.github} repos={repos} status={status} ui={content.ui.github} />
      <Education education={content.education} ui={content.ui.education} />
      <Contact contact={content.contact} ui={content.ui.contact} />
      <Footer footer={content.footer} ui={content.ui.footer} />
    </>
  );
}

export default App;
