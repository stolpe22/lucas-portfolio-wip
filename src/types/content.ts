export interface SectionHeadConfig {
  eyebrow: string;
  heading: string;
  subheading?: string;
}

export interface SiteContent {
  meta: {
    lang: string;
    title: string;
    description: string;
    favicon: string;
  };
  theme: {
    default: "dark" | "light";
  };
  nav: Array<{
    label: string;
    href: string;
  }>;
  brand: {
    label: string;
    wordmarkAlt: string;
  };
  hero: {
    eyebrow: string;
    role: string;
    description: string;
    ctas: Array<{
      label: string;
      href: string;
      style: "primary" | "ghost";
    }>;
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  skills: {
    sectionHead: SectionHeadConfig;
    groups: Array<{
      category: string;
      items: string[];
    }>;
  };
  experience: {
    sectionHead: SectionHeadConfig;
    previewCount: number;
    items: Array<{
      role: string;
      company: string;
      period: string;
      location: string;
      current: boolean;
      movement?: {
        promotion?: boolean;
        roleChange?: boolean;
        sectorChange?: boolean;
      };
      bullets: string[];
    }>;
  };
  projects: {
    sectionHead: SectionHeadConfig;
    items: Array<{
      name: string;
      subtitle: string;
      description: string;
      visibility: "public" | "private";
      tech: string[];
      matchKeywords: string[];
    }>;
  };
  github: {
    username: string;
    perPage: number;
    excludeForks: boolean;
    sectionHead: SectionHeadConfig;
  };
  education: {
    sectionHead: SectionHeadConfig;
    items: Array<{
      title: string;
      place: string;
      period: string;
    }>;
    certifications: Array<{
      title: string;
      issuer: string;
      date: string;
    }>;
    highlights: Array<{
      title: string;
      detail: string;
    }>;
    languages: Array<{
      name: string;
      level: string;
    }>;
  };
  contact: {
    eyebrow: string;
    heading: string;
    message: string;
    email: string;
    whatsapp: string;
    linkedin: string;
    github: string;
  };
  footer: {
    copyrightHolder: string;
    brandText: string;
    brandLogo?: string;
  };
  ui: {
    nav: {
      navigationAriaLabel: string;
      themeToggleAriaLabel: string;
      mobileMenuAriaLabel: string;
      languageSwitcherAriaLabel: string;
    };
    hero: {
      scrollHint: string;
    };
    dice: {
      eyebrow: string;
      heading: string;
      subheading: string;
      buttonIdle: string;
      buttonRolling: string;
      resultPrefix: string;
      ariaLabel: string;
      toggleOpen: string;
      toggleClose: string;
      clickHint: string;
      sectionMessages: {
        sobre: string;
        experiencia: string;
        skills: string;
        projetos: string;
        repos: string;
        contato: string;
      };
    };
    experience: {
      liveStatus: string;
      showFullTimeline: string;
      showLessTimeline: string;
      promotionLabel: string;
    };
    projects: {
      viewCode: string;
      publicLabel: string;
      privateLabel: string;
    };
    github: {
      searchPlaceholder: string;
      sortUpdated: string;
      sortStars: string;
      sortName: string;
      repoCountSingular: string;
      repoCountPlural: string;
      loadingError: string;
      directProfileLabel: string;
      emptyResults: string;
      noDescription: string;
    };
    education: {
      academicTitle: string;
      languagesTitle: string;
      certificationsTitle: string;
      highlightsTitle: string;
    };
    contact: {
      emailButton: string;
      whatsappButton: string;
      linkedinButton: string;
      emailAriaLabel: string;
      whatsappAriaLabel: string;
    };
    footer: {
      rightsReserved: string;
      brandAlt: string;
    };
  };
}
