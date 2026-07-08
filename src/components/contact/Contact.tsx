import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { EmailIcon, GithubIcon, LinkedinIcon, WhatsappIcon } from "../shared/icons";

interface ContactProps {
  contact: SiteContent["contact"];
  ui: SiteContent["ui"]["contact"];
}

export function Contact({ contact, ui }: ContactProps) {
  const revealRef = useReveal<HTMLDivElement>(0);

  return (
    <section className="relative py-20 md:py-28" id="contato">
      <div className="container-shell">
        <div className="reveal rounded-3xl border border-border-subtle bg-surface px-6 py-10 text-center md:px-10" ref={revealRef}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>{contact.eyebrow}</div>
          <h2 className="[font-family:var(--font-heading)] text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold">{contact.heading}</h2>
          <p className="mx-auto mt-3 max-w-[58ch] text-text-muted">{contact.message}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-glow to-violet-glow px-6 py-3 [font-family:var(--font-heading)] text-[.95rem] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(139,92,246,.55)] transition hover:-translate-y-0.5" href={`mailto:${contact.email}`}>{ui.emailButton}</a>
            <a className="inline-flex items-center rounded-full border border-border-strong px-6 py-3 [font-family:var(--font-heading)] text-[.95rem] font-semibold transition hover:-translate-y-0.5 hover:border-violet-glow hover:bg-[var(--grad-soft)]" href={contact.whatsapp} target="_blank" rel="noopener">{ui.whatsappButton}</a>
            <a className="inline-flex items-center rounded-full border border-border-strong px-6 py-3 [font-family:var(--font-heading)] text-[.95rem] font-semibold transition hover:-translate-y-0.5 hover:border-violet-glow hover:bg-[var(--grad-soft)]" href={contact.linkedin} target="_blank" rel="noopener">{ui.linkedinButton}</a>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <a className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-text-muted transition hover:border-violet-glow hover:text-text-main" href={contact.github} target="_blank" rel="noopener" aria-label="GitHub"><GithubIcon /></a>
            <a className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-text-muted transition hover:border-violet-glow hover:text-text-main" href={`mailto:${contact.email}`} target="_blank" rel="noopener" aria-label={ui.emailAriaLabel}><EmailIcon /></a>
            <a className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-text-muted transition hover:border-violet-glow hover:text-text-main" href={contact.whatsapp} target="_blank" rel="noopener" aria-label={ui.whatsappAriaLabel}><WhatsappIcon /></a>
            <a className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-text-muted transition hover:border-violet-glow hover:text-text-main" href={contact.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn"><LinkedinIcon /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
