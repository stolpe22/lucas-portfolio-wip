import { useState } from "react";
import type { SupportedLanguage } from "../../config/content";
import type { SiteContent } from "../../types/content";
import { useNavScrolled } from "../../hooks/useNavScrolled";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { DownloadIcon } from "../shared/icons";

interface NavProps {
  navItems: SiteContent["nav"];
  brandLabel: string;
  onToggleTheme: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (language: SupportedLanguage) => void;
  onToggleLanguage: () => void;
  onDownloadResume: () => void;
  ui: SiteContent["ui"]["nav"];
}

const iconButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-subtle text-text-muted transition-colors hover:border-border-strong hover:text-text-main md:h-9 md:w-9";

export function Nav({
  navItems,
  brandLabel,
  onToggleTheme,
  language,
  onChangeLanguage,
  onToggleLanguage,
  onDownloadResume,
  ui,
}: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHref = useScrollSpy(navItems.map((item) => item.href));
  const isScrolled = useNavScrolled();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[110] border-b py-3 transition-colors ${
        isScrolled ? "nav-solid border-border-subtle" : "border-transparent"
      }`}
      id="nav"
    >
      <div className="container-shell flex items-center justify-between gap-4">
        <a href="#" className="[font-family:var(--font-mono)] text-sm font-medium text-text-main">
          {brandLabel}
        </a>
        <nav className="hidden items-center gap-6 xl:flex" id="navLinks" aria-label={ui.navigationAriaLabel}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors hover:text-text-main ${
                activeHref === item.href ? "text-text-main underline decoration-accent decoration-2 underline-offset-[6px]" : "text-text-muted"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center [font-family:var(--font-mono)] text-xs md:inline-flex"
            aria-label={ui.languageSwitcherAriaLabel}
          >
            {(["pt", "en"] as const).map((code, index) => (
              <span key={code} className="inline-flex items-center">
                {index > 0 ? <span className="px-1 text-text-faint">/</span> : null}
                <button
                  onClick={() => onChangeLanguage(code)}
                  className={`px-1 py-1 uppercase transition-colors ${
                    language === code ? "text-text-main" : "text-text-faint hover:text-text-main"
                  }`}
                  aria-pressed={language === code}
                >
                  {code}
                </button>
              </span>
            ))}
          </div>
          <button className={iconButton} onClick={onToggleTheme} aria-label={ui.themeToggleAriaLabel}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDownloadResume}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-text-main px-3 text-[.82rem] md:min-h-9 font-medium text-bg transition-colors hover:bg-accent hover:text-on-accent"
          >
            <DownloadIcon />
            {ui.resumeButton}
          </button>
          <button
            className={`${iconButton} xl:hidden`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={ui.mobileMenuAriaLabel}
            aria-expanded={menuOpen}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>
      <div
        className={`absolute inset-x-4 top-full mt-2 flex flex-col overflow-hidden rounded-md border border-border-subtle bg-surface transition-all xl:hidden ${
          menuOpen ? "max-h-96 p-2 opacity-100" : "pointer-events-none max-h-0 border-transparent p-0 opacity-0"
        }`}
        id="mobilePanel"
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="flex min-h-11 items-center rounded px-3 text-[.95rem] text-text-muted hover:bg-surface-2 hover:text-text-main"
          >
            {item.label}
          </a>
        ))}
        <button
          onClick={onToggleLanguage}
          className="mt-1 border-t border-border-subtle px-3 pb-1 pt-3 text-left text-sm text-text-muted hover:text-text-main"
        >
          {language === "pt" ? "Switch to English" : "Mudar para Português"}
        </button>
      </div>
    </header>
  );
}
