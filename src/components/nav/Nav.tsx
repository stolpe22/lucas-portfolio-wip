import { useState } from "react";
import type { SupportedLanguage } from "../../config/content";
import type { SiteContent } from "../../types/content";
import { useNavScrolled } from "../../hooks/useNavScrolled";
import { useScrollSpy } from "../../hooks/useScrollSpy";

interface NavProps {
  navItems: SiteContent["nav"];
  brandLabel: string;
  onToggleTheme: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (language: SupportedLanguage) => void;
  onToggleLanguage: () => void;
  ui: SiteContent["ui"]["nav"];
}

export function Nav({ navItems, brandLabel, onToggleTheme, language, onChangeLanguage, onToggleLanguage, ui }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHref = useScrollSpy(navItems.map((item) => item.href));
  const isScrolled = useNavScrolled();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-transparent py-4 transition-all ${isScrolled ? "glass-nav border-border-subtle py-3" : ""}`}
      id="nav"
    >
      <div className="container-shell flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 [font-family:var(--font-heading)] text-sm font-semibold tracking-[0.02em]">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-glow to-violet-glow"></span>
          <span>{brandLabel}</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex" id="navLinks" aria-label={ui.navigationAriaLabel}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors hover:text-violet-glow ${
                activeHref === item.href ? "text-violet-glow" : "text-text-muted"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-border-subtle bg-surface p-0.5 md:inline-flex" aria-label={ui.languageSwitcherAriaLabel}>
            <button
              onClick={() => onChangeLanguage("pt")}
              className={`rounded-full px-2 py-1 text-xs font-semibold transition ${language === "pt" ? "bg-violet-glow text-white" : "text-text-muted hover:text-text-main"}`}
            >
              PT
            </button>
            <button
              onClick={() => onChangeLanguage("en")}
              className={`rounded-full px-2 py-1 text-xs font-semibold transition ${language === "en" ? "bg-violet-glow text-white" : "text-text-muted hover:text-text-main"}`}
            >
              EN
            </button>
          </div>
          <button
            className="rounded-full border border-border-subtle bg-surface p-2 text-text-muted transition hover:border-violet-glow hover:text-text-main"
            onClick={onToggleTheme}
            aria-label={ui.themeToggleAriaLabel}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <button
            className="rounded-full border border-border-subtle bg-surface p-2 text-text-muted transition hover:border-violet-glow hover:text-text-main md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={ui.mobileMenuAriaLabel}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>
      <div
        className={`container-shell mt-2 flex flex-col gap-2 overflow-hidden rounded-2xl border border-border-subtle bg-surface p-3 transition-all md:hidden ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 border-transparent p-0 opacity-0"
        }`}
        id="mobilePanel"
      >
        <button
          onClick={onToggleLanguage}
          className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-text-muted hover:bg-surface-2 hover:text-text-main"
        >
          {language === "pt" ? "Switch to English" : "Mudar para Portugues"}
        </button>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text-main">
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}
