import type { ReactNode } from "react";
import qrcode from "qrcode-generator";
import type { SiteContent } from "../../types/content";
import { formatDuration, formatMonth, formatPeriod, monthsBetween, shortUrl } from "../../lib/format";

/**
 * Printable A4 résumé, rendered from the same content JSON as the site.
 * It is hidden on screen and is the only thing visible when printing (see App.tsx),
 * so "Save as PDF" produces the résumé file.
 *
 * Colors are hardcoded on purpose: the PDF must look the same regardless of the site theme.
 */

const ACCENT = "#b13a0b";
const INK = "#1a1a1a";
const MUTED = "#4a4a4a";
const RULE = "#d9d4cb";

/** QR code as crisp SVG squares (prints sharp at any size). */
function QrCode({ value, size }: { value: string; size: string }) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 2;
  const cells: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) cells.push(`M${c + quiet} ${r + quiet}h1v1h-1z`);
    }
  }
  const box = count + quiet * 2;
  return (
    <svg viewBox={`0 0 ${box} ${box}`} style={{ width: size, height: size }} shapeRendering="crispEdges" aria-hidden="true">
      <rect width={box} height={box} fill="#fff" />
      <path d={cells.join("")} fill={INK} />
    </svg>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{ color: ACCENT, borderBottom: `0.6pt solid ${RULE}` }}
      className="mb-[5pt] pb-[2pt] text-[8.6pt] font-semibold uppercase tracking-[0.09em]"
    >
      {children}
    </h2>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-[2.5pt] flex flex-col gap-[1.2pt]">
      {items.map((item) => (
        <li key={item} className="relative pl-[9pt]">
          <span className="absolute left-[1pt] top-0" style={{ color: ACCENT }}>
            •
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

interface ResumeProps {
  content: SiteContent;
}

export function Resume({ content }: ResumeProps) {
  const { resume, contact, skills, experience, initiatives, projects, education, ui } = content;
  const dates = ui.dates;
  const labels = ui.resume;

  const contactLine = [contact.location, contact.phone, contact.email].join("  ·  ");

  return (
    <div
      className="mx-auto w-[210mm] bg-white px-[12mm] py-[11mm] text-[8.4pt] leading-[1.38] [font-family:var(--font-body)] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
      style={{ color: MUTED }}
      lang={content.meta.lang}
    >
      {/* Header */}
      <header className="mb-[9pt]">
        <div className="flex items-start justify-between gap-[12pt]">
          <div className="min-w-0">
            <h1 className="text-[20pt] font-semibold leading-none tracking-[-0.01em]" style={{ color: INK }}>
              {resume.fullName}
            </h1>
            <div className="mt-[3pt] text-[10.5pt] font-medium" style={{ color: ACCENT }}>
              {resume.headline}
            </div>
            <div className="mt-[5pt] text-[8.2pt]">{contactLine}</div>
            <div className="text-[8.2pt]">
              <a href={contact.linkedin} style={{ color: MUTED }}>
                {shortUrl(contact.linkedin)}
              </a>
              {"  ·  "}
              <a href={contact.github} style={{ color: MUTED }}>
                {shortUrl(contact.github)}
              </a>
            </div>
            {resume.birthDate ? <div className="text-[8.2pt]">{resume.birthDate}</div> : null}
          </div>
          <a href={contact.linkedin} className="flex shrink-0 flex-col items-center" style={{ color: INK }}>
            <QrCode value={contact.linkedin} size="19mm" />
            <span className="mt-[1pt] text-[7pt] font-medium">{labels.linkedinQr}</span>
          </a>
        </div>
        <p className="mt-[7pt] text-justify" style={{ color: INK }}>
          {resume.summary}
        </p>
      </header>

      {/* Floats instead of grid: floats fragment across printed pages reliably in every browser. */}
      <div className="flow-root">
        {/* Sidebar */}
        <aside className="float-left w-[31%] space-y-[10pt]">
          <section>
            <Heading>{labels.skills}</Heading>
            <div className="flex flex-col gap-[4pt]">
              {skills.groups.map((group) => (
                <p key={group.category}>
                  <span className="font-semibold" style={{ color: INK }}>
                    {group.category}:
                  </span>{" "}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </section>

          <section>
            <Heading>{labels.education}</Heading>
            <div className="flex flex-col gap-[4pt]">
              {education.items.map((item) => (
                <div key={item.title}>
                  <div className="font-semibold" style={{ color: INK }}>
                    {item.title}
                  </div>
                  <div>
                    {item.place} · {item.period}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Heading>{labels.certifications}</Heading>
            <ul className="flex flex-col gap-[2.5pt]">
              {education.certifications.map((cert) => (
                <li key={`${cert.title}-${cert.date}`}>
                  <span style={{ color: INK }}>{cert.title}</span> · {cert.issuer} ({cert.date})
                </li>
              ))}
            </ul>
          </section>

          <section>
            <Heading>{labels.languages}</Heading>
            {education.languages.map((language) => (
              <p key={language.name}>
                <span className="font-semibold" style={{ color: INK }}>
                  {language.name}:
                </span>{" "}
                {language.level}
              </p>
            ))}
          </section>

          <section>
            <Heading>{labels.highlights}</Heading>
            <ul className="flex flex-col gap-[2.5pt]">
              {education.highlights.map((highlight) => (
                <li key={highlight.detail}>
                  <span style={{ color: INK }}>{highlight.title}</span>: {highlight.detail}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Main column */}
        <main className="ml-[calc(31%+14pt)] space-y-[10pt]">
          <section>
            <Heading>{labels.experience}</Heading>
            <div className="flex flex-col gap-[6.5pt]">
              {experience.items.map((item) => (
                <article key={`${item.company}-${item.start}`} className="break-inside-avoid">
                  <div className="text-[9.2pt] font-semibold" style={{ color: INK }}>
                    {item.role}
                  </div>
                  <div className="text-[8pt]">
                    <span className="font-medium" style={{ color: INK }}>
                      {item.company}
                    </span>{" "}
                    · {formatPeriod(item.start, item.end, dates)} ({formatDuration(monthsBetween(item.start, item.end), dates)}) ·{" "}
                    {item.location}
                  </div>
                  <Bullets items={item.bullets} />
                </article>
              ))}
            </div>
          </section>

          <section>
            <Heading>{labels.initiatives}</Heading>
            {initiatives.items.map((item) => (
              <article key={item.name} className="break-inside-avoid">
                <div className="text-[9.2pt] font-semibold" style={{ color: INK }}>
                  {item.role} · {item.name}
                </div>
                <div className="text-[8pt]">
                  <span className="font-medium" style={{ color: INK }}>
                    {item.org}
                  </span>{" "}
                  · {formatMonth(item.start, dates)} · {item.location} · {item.kind}
                </div>
                <Bullets items={item.bullets} />
              </article>
            ))}
          </section>

          <section>
            <Heading>{labels.projects}</Heading>
            <div className="flex flex-col gap-[6pt]">
              {projects.items.map((project) => (
                <article key={project.name} className="break-inside-avoid">
                  <div className="text-[9.2pt] font-semibold" style={{ color: INK }}>
                    {project.name} <span className="font-normal" style={{ color: MUTED }}>· {project.subtitle}</span>
                  </div>
                  <p className="mt-[1.5pt]">{project.description}</p>
                  <p className="mt-[1.5pt]">
                    <span className="font-medium" style={{ color: INK }}>
                      {labels.technologies}:
                    </span>{" "}
                    {project.tech.join(", ")}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
