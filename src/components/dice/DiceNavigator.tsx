import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "../../types/content";
import { scrollToTarget } from "../../lib/gsap";

interface DiceNavigatorProps {
  navItems: SiteContent["nav"];
  ui: SiteContent["ui"]["dice"];
}

/**
 * Eight-sided die (octahedron) seen from the front: a diamond silhouette, the face toward
 * the viewer is the top triangle (with the number), the lower facets are shaded.
 */
function D8({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <polygon points="50,4 95,52 50,96 5,52" className="fill-surface-2 stroke-border-strong" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="50,96 5,52 14,64" className="fill-border-subtle" />
      <polygon points="50,96 95,52 86,64" className="fill-border-subtle" />
      <polygon points="50,4 86,64 14,64" className="fill-surface stroke-border-strong" strokeWidth="2" strokeLinejoin="round" />
      <line x1="14" y1="64" x2="50" y2="96" className="stroke-border-strong" strokeWidth="1.5" />
      <line x1="86" y1="64" x2="50" y2="96" className="stroke-border-strong" strokeWidth="1.5" />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-accent [font-family:var(--font-display)]"
        fontSize="26"
        fontWeight="700"
      >
        {value}
      </text>
    </svg>
  );
}

export function DiceNavigator({ navItems, ui }: DiceNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [face, setFace] = useState(1);
  const [rollState, setRollState] = useState<"idle" | "rolling" | "landed" | "returning">("idle");
  const [landedSection, setLandedSection] = useState<string>("");
  const [landedSectionId, setLandedSectionId] = useState<string | null>(null);
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const diceRef = useRef<HTMLButtonElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const animationRef = useRef<Animation | null>(null);
  const runIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // One face per menu item, in menu order (1 = first item ... 8 = last), capped at 8 faces.
  const availableSections = useMemo(() => navItems.slice(0, 8), [navItems]);
  const sides = Math.max(1, availableSections.length);

  const clearAnimation = () => {
    if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }
  };

  const clearTimers = useCallback(() => {
    runIdRef.current += 1;

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    timeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutRefs.current = [];

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    clearAnimation();
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const timeoutId = window.setTimeout(resolve, ms);
      timeoutRefs.current.push(timeoutId);
    });

  const trackBubbleWithDice = (runId: number, ms: number) =>
    new Promise<void>((resolve) => {
      const startedAt = performance.now();

      const tick = (now: number) => {
        if (runIdRef.current !== runId) {
          if (rafRef.current !== null) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          resolve();
          return;
        }

        setBubblePosition(getDockBubblePosition());

        if (now - startedAt >= ms) {
          rafRef.current = null;
          resolve();
          return;
        }

        rafRef.current = window.requestAnimationFrame(tick);
      };

      rafRef.current = window.requestAnimationFrame(tick);
    });

  const animateDice = (
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) =>
    new Promise<void>((resolve) => {
      const element = diceRef.current;
      if (!element) {
        resolve();
        return;
      }

      clearAnimation();

      const animation = element.animate(keyframes, {
        ...options,
        fill: "forwards",
      });

      animationRef.current = animation;

      animation.onfinish = () => {
        if (animationRef.current === animation) {
          animationRef.current = null;
        }
        resolve();
      };

      animation.oncancel = () => {
        if (animationRef.current === animation) {
          animationRef.current = null;
        }
        resolve();
      };
    });

  const getTargetOffset = () => {
    const element = diceRef.current;
    if (!element) {
      return { x: 0, y: 0 };
    }

    const rect = element.getBoundingClientRect();
    const targetX = window.innerWidth * 0.58;
    const targetY = window.innerHeight * 0.62;

    return {
      x: targetX - rect.left,
      y: targetY - rect.top,
    };
  };

  const getDockBubblePosition = () => {
    const element = diceRef.current;
    if (!element) {
      return { x: 112, y: 110 };
    }

    const rect = element.getBoundingClientRect();
    return {
      x: rect.right + 12,
      y: rect.top + 6,
    };
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (!isOpen || !landedSectionId) {
      return;
    }

    const element = diceRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    setBubblePosition({
      x: rect.right + 12,
      y: rect.top + 6,
    });
  }, [isOpen, landedSectionId]);

  const handleRoll = async () => {
    if (rollState !== "idle" || availableSections.length === 0) {
      return;
    }

    runIdRef.current += 1;
    const runId = runIdRef.current;

    setRollState("rolling");
    setLandedSection("");
    setLandedSectionId(null);
    setBubblePosition(null);

    const finalFace = Math.floor(Math.random() * sides) + 1;
    // Whole turns only, so the die lands (and returns) upright with the number readable.
    const spinBase = 360 * (3 + Math.floor(Math.random() * 2));
    const { x, y } = getTargetOffset();
    const apexY = -Math.max(120, y * 0.3);

    intervalRef.current = window.setInterval(() => {
      setFace(Math.floor(Math.random() * sides) + 1);
    }, 85);

    await animateDice(
      [
        { transform: "translate(0px, 0px) rotate(0deg)" },
        { transform: `translate(${x * 0.5}px, ${apexY}px) rotate(${spinBase * 0.55}deg)` },
        { transform: `translate(${x}px, ${y}px) rotate(${spinBase}deg)` },
      ],
      {
        duration: 1100,
        easing: "cubic-bezier(0.2, 0.78, 0.12, 1)",
      },
    );

    if (runIdRef.current !== runId) {
      return;
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setFace(finalFace);
    setRollState("landed");

    // The face that landed is the section: 1 = first menu item ... 8 = last.
    const targetSection = availableSections[finalFace - 1];
    if (!targetSection) {
      setRollState("idle");
      return;
    }

    setLandedSection(targetSection.label);
    const messageKey = targetSection.href.replace("#", "");
    setLandedSectionId(messageKey);
    setBubblePosition({ x: window.innerWidth * 0.58 + 92, y: window.innerHeight * 0.62 + 6 });

    await wait(900);
    if (runIdRef.current !== runId) {
      return;
    }

    setRollState("returning");

    const followBubblePromise = trackBubbleWithDice(runId, 700);

    await animateDice(
      [
        { transform: `translate(${x}px, ${y}px) rotate(${spinBase}deg)` },
        { transform: `translate(0px, 0px) rotate(${spinBase + 360}deg)` },
      ],
      {
        duration: 650,
        easing: "cubic-bezier(0.24, 0.92, 0.26, 1)",
      },
    );

    await followBubblePromise;

    if (runIdRef.current !== runId) {
      return;
    }

    setBubblePosition(getDockBubblePosition());

    const elementId = targetSection.href.replace("#", "");
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      scrollToTarget(targetElement);
    }

    setRollState("idle");

    await wait(5500);
    if (runIdRef.current !== runId) {
      return;
    }

    setLandedSection("");
    setLandedSectionId(null);
    setBubblePosition(null);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 left-3 z-[90] hidden md:block print:hidden" aria-label={ui.ariaLabel}>
      {isOpen && landedSectionId && bubblePosition ? (
        <div
          className="fixed max-w-[320px] border-[1.5px] border-text-main bg-surface px-3 py-2 text-xs text-text-main shadow-[4px_4px_0_var(--text)]"
          style={{ left: `${bubblePosition.x}px`, top: `${bubblePosition.y}px` }}
        >
          <span className="block [font-family:var(--font-mono)] text-[10px] uppercase tracking-wide text-accent">{landedSection}</span>
          <span>{ui.sectionMessages[landedSectionId] ?? ""}</span>
        </div>
      ) : null}

      <div className="pointer-events-auto flex flex-col-reverse items-start gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="btn btn-ghost btn-sm [font-family:var(--font-mono)]"
        >
          {isOpen ? ui.toggleClose : ui.toggleOpen}
        </button>

        {isOpen ? (
          <div className="card-hard p-3">
            <div className="text-[11px] [font-family:var(--font-mono)] text-accent">{ui.eyebrow}</div>
            <div className="mt-1 [font-family:var(--font-heading)] text-sm font-semibold text-text-main">{ui.heading}</div>
            <p className="mt-1 max-w-[34ch] text-xs text-text-muted">{ui.subheading}</p>
            <ol className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {availableSections.map((section, index) => {
                const hit = landedSection === section.label;
                return (
                  <li
                    key={section.href}
                    className={`flex items-baseline gap-1.5 text-[11px] transition-colors ${hit ? "text-accent" : "text-text-muted"}`}
                  >
                    <span className={`w-3 text-right [font-family:var(--font-mono)] ${hit ? "text-accent" : "text-text-faint"}`}>{index + 1}</span>
                    {section.label}
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 text-[11px] text-text-faint">{ui.clickHint}</div>
            <div className="mt-2 min-h-4 [font-family:var(--font-mono)] text-[11px] text-accent">{landedSection ? `${ui.resultPrefix}: ${landedSection}` : ""}</div>
          </div>
        ) : null}

        {isOpen ? (
          <button
            ref={diceRef}
            type="button"
            onClick={handleRoll}
            disabled={rollState !== "idle"}
            className="h-20 w-20 transition-transform hover:scale-105 disabled:cursor-not-allowed [filter:drop-shadow(0_8px_14px_rgba(0,0,0,0.18))]"
            aria-label={rollState === "rolling" ? ui.buttonRolling : ui.buttonIdle}
          >
            <D8 value={face} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
