import type { SiteContent } from "../../types/content";
import { useReveal } from "../../hooks/useReveal";
import { shortUrl } from "../../lib/format";
import { DownloadIcon } from "../shared/icons";

interface ContactProps {
  contact: SiteContent["contact"];
  ui: SiteContent["ui"]["contact"];
  onDownloadResume: () => void;
}

export function Contact({ contact, ui, onDownloadResume }: ContactProps) {
  const ref = useReveal<HTMLDivElement>(0);

  const links = [
    { label: ui.whatsappButton, value: contact.phone, href: contact.whatsapp },
    { label: ui.linkedinButton, value: shortUrl(contact.linkedin).replace("linkedin.com/in/", "in/"), href: contact.linkedin },
    { label: "GitHub", value: shortUrl(contact.github).replace("github.com/", "@"), href: contact.github },
  ];

  return (
    <section className="relative scroll-mt-16 py-16 md:py-24" id="contato">
      <div className="container-shell">
        <div className="grid gap-6 border-t border-border-strong pt-6 md:grid-cols-[180px_1fr] md:gap-10">
          <div className="label-mono">{contact.eyebrow}</div>
          <div className="reveal min-w-0" ref={ref}>
            <h2 className="[font-family:var(--font-heading)] text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-tight tracking-[-0.02em]">
              {contact.heading}
            </h2>
            <p className="mt-3 max-w-[56ch] text-[1.05rem] text-text-muted">{contact.message}</p>

            <a
              href={`mailto:${contact.email}`}
              className="mt-8 inline-block break-all [font-family:var(--font-heading)] text-[clamp(1.3rem,3.6vw,2.2rem)] font-medium text-accent link-underline"
            >
              {contact.email}
            </a>

            <ul className="mt-10 grid max-w-[680px] border-t border-border-subtle sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.label} className="border-b border-border-subtle sm:border-b-0 sm:border-l sm:first:border-l-0">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener"
                    className="spotlight block py-4 transition-colors hover:text-accent sm:px-4"
                  >
                    <span className="label-mono block">{link.label}</span>
                    <span className="mt-1 block text-[.95rem] text-text-main">{link.value}</span>
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onDownloadResume}
              className="mt-10 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[.95rem] font-medium text-on-accent transition-colors hover:bg-text-main hover:text-bg"
            >
              <DownloadIcon />
              {ui.resumeButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
