import { useEffect, useId, useRef, useState } from "react";

interface HelpTipProps {
  text: string;
  label: string;
}

/**
 * "?" next to a number explaining how it is counted (Nielsen #10, help in place).
 * Opens on hover/focus with a mouse, on tap on touch; Esc or tapping outside closes it.
 */
export function HelpTip({ text, label }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-6 w-6 items-center justify-center border border-text-main/50 [font-family:var(--font-mono)] text-[.7rem] text-text-muted transition-colors hover:border-text-main hover:bg-text-main hover:text-bg"
      >
        ?
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-2 w-64 max-w-[calc(100vw-32px)] -translate-x-1/2 border-[1.5px] border-text-main bg-surface p-3 text-left text-[.82rem] leading-snug text-text-muted shadow-[4px_4px_0_var(--text)]"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
