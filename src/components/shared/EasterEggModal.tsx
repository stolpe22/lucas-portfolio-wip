import { useEffect, useState } from "react";
import type { SiteContent } from "../../types/content";
import { Confetti } from "./Confetti";

interface EasterEggModalProps {
  content: SiteContent["ui"]["easterEgg"];
  onClose: () => void;
}

const CONFETTI_DURATION_MS = 3500;

export function EasterEggModal({ content, onClose }: EasterEggModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      {showConfetti ? <Confetti /> : null}
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-strong bg-surface p-8 shadow-[0_30px_80px_-24px_rgba(0,0,0,.6)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={content.closeAriaLabel}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-text-muted transition hover:border-violet-glow hover:text-text-main"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 className="gradient-text mb-4 pr-8 [font-family:var(--font-display)] text-[clamp(1.5rem,3.4vw,2rem)] font-bold">
            {content.title}
          </h2>

          <div className="space-y-3 text-text-muted">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }}></p>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-blue-glow to-violet-glow px-6 py-3 [font-family:var(--font-heading)] text-[.95rem] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(139,92,246,.55)] transition hover:-translate-y-0.5"
          >
            {content.closeLabel}
          </button>
        </div>
      </div>
    </>
  );
}
