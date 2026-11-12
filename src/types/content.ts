export interface SectionHeadConfig {
  eyebrow: string;
  heading: string;
  subheading?: string;
}

/** "YYYY-MM" */
export type YearMonth = string;

export interface ExperienceItem {
  role: string;
  company: string;
  start: YearMonth;
  /** null = current position */
  end: YearMonth | null;
  location: string;
  /** Counts toward the "leading teams" stat. */
  leadership?: boolean;
  movement?: {
    promotion?: boolean;
    roleChange?: boolean;
    sectorChange?: boolean;
  };
  bullets: string[];
}

export type MilestoneKind = "job" | "promotion" | "shift" | "education" | "event";

export interface Milestone {
  /** "YYYY-MM", or "YYYY" when only the year is known (shown as the year only). */
  date: string;
  title: string;
  description: string;
  kind: MilestoneKind;
}

export interface InitiativeItem {
  role: string;
  name: string;
  org: string;
  start: YearMonth;
  end: YearMonth;
  location: string;
  kind: string;
  bullets: string[];
  facts: Array<{ value: string; label: string }>;
}

export interface HeroCta {
  label: string;
  href?: string;
  action?: "resume" | "milestones";
  style: "primary" | "ghost";
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
    photo?: string;
    photoAlt?: string;
    ctas: HeroCta[];
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    stats: Array<{
      /** Fixed value, or computed from experience: total worked time / time in leadership roles. */
      value?: string;
      compute?: "experience" | "leadership";
      label: string;
      /** What the number means and how it is counted (shown behind a "?"). */
      help: string;
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
    items: ExperienceItem[];
  };
  /** Full-screen "career milestones" view, opened from the hero and the experience section. */
  milestones: {
    heading: string;
    subheading: string;
    items: Milestone[];
  };
  initiatives: {
    sectionHead: SectionHeadConfig;
    items: InitiativeItem[];
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
    phone: string;
    location: string;
    whatsapp: string;
    linkedin: string;
    github: string;
  };
  /** Fields that only appear on the printable résumé. Everything else is reused from the sections above. */
  resume: {
    fileName: string;
    fullName: string;
    headline: string;
    birthDate?: string;
    summary: string;
  };
  footer: {
    copyrightHolder: string;
    brandText: string;
    brandLogo?: string;
  };
  ui: {
    dates: {
      months: string[];
      present: string;
      year: string;
      years: string;
      month: string;
      monthsLabel: string;
      and: string;
    };
    nav: {
      navigationAriaLabel: string;
      themeToggleAriaLabel: string;
      mobileMenuAriaLabel: string;
      languageSwitcherAriaLabel: string;
      resumeButton: string;
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
      /** Keyed by section id (nav href without "#"). */
      sectionMessages: Record<string, string>;
    };
    help: {
      label: string;
    };
    milestones: {
      eyebrow: string;
      back: string;
      play: string;
      pause: string;
      replay: string;
      previous: string;
      next: string;
      roleAtTime: string;
      sinceLast: string;
      firstOne: string;
      hint: string;
      swipeHint: string;
      kinds: Record<MilestoneKind, string>;
    };
    experience: {
      liveStatus: string;
      showFullTimeline: string;
      showLessTimeline: string;
      promotionLabel: string;
      timelineCaption: string;
      timelineAria: string;
      openMilestones: string;
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
      sortLabel: string;
      languagesLabel: string;
      noLanguage: string;
      showing: string;
      of: string;
      searchChip: string;
      removeFilter: string;
      clearAll: string;
      clearFilters: string;
      syncedLabel: string;
      moreBelow: string;
      colName: string;
      colLanguage: string;
      colUpdated: string;
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
      resumeButton: string;
      emailAriaLabel: string;
      whatsappAriaLabel: string;
    };
    resume: {
      skills: string;
      education: string;
      certifications: string;
      languages: string;
      highlights: string;
      experience: string;
      initiatives: string;
      projects: string;
      technologies: string;
      linkedinQr: string;
    };
    footer: {
      rightsReserved: string;
      brandAlt: string;
    };
    easterEgg: {
      keyword: string;
      title: string;
      paragraphs: string[];
      closeLabel: string;
      closeAriaLabel: string;
    };
  };
}
