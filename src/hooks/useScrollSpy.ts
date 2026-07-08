import { useEffect, useState } from "react";

export function useScrollSpy(hrefs: string[]) {
  const [activeHref, setActiveHref] = useState<string>(hrefs[0] || "");

  useEffect(() => {
    const sections = hrefs
      .map((href) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [hrefs]);

  return activeHref;
}
