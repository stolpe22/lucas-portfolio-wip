import type { SiteContent } from "../../types/content";

interface FooterProps {
  footer: SiteContent["footer"];
  ui: SiteContent["ui"]["footer"];
}

export function Footer({ footer, ui }: FooterProps) {
  const year = new Date().getFullYear();
  const brandLogoSrc = footer.brandLogo?.startsWith("/")
    ? `${import.meta.env.BASE_URL}${footer.brandLogo.slice(1)}`
    : footer.brandLogo;

  return (
    <footer className="border-t border-border-subtle py-7">
      <div className="container-shell flex flex-col items-start justify-between gap-3 text-sm text-text-faint md:flex-row md:items-center">
        <span>{`© ${year} ${footer.copyrightHolder}. ${ui.rightsReserved}`}</span>
        <span className="inline-flex items-center gap-2 [font-family:var(--font-heading)] text-text-muted">
          {brandLogoSrc ? <img src={brandLogoSrc} alt={ui.brandAlt} className="h-6 w-auto" /> : null}
          {footer.brandText}
        </span>
      </div>
    </footer>
  );
}
