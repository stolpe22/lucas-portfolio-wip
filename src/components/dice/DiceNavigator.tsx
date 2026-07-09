import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "../../types/content";

interface DiceNavigatorProps {
  navItems: SiteContent["nav"];
  ui: SiteContent["ui"]["dice"];
}

export const EASTER_EGG_ROLL_EVENT = "easter-egg:roll-dice";

const faceMap: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceNavigator({ navItems, ui }: DiceNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [face, setFace] = useState(1);
  const [rollState, setRollState] = useState<"idle" | "rolling" | "landed" | "returning">("idle");
  const [landedSection, setLandedSection] = useState<string>("");
  const [landedSectionId, setLandedSectionId] = useState<keyof SiteContent["ui"]["dice"]["sectionMessages"] | null>(null);
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | null>(null);
  const diceRef = useRef<HTMLButtonElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const animationRef = useRef<Animation | null>(null);
  const runIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pendingAutoRollRef = useRef(false);

  const availableSections = useMemo(() => navItems.slice(0, 6), [navItems]);
  const activePips = faceMap[face] ?? faceMap[1];

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

    const finalFace = Math.floor(Math.random() * 6) + 1;
    const spinBase = 1000 + Math.floor(Math.random() * 280);
    const { x, y } = getTargetOffset();
    const apexY = -Math.max(120, y * 0.3);

    intervalRef.current = window.setInterval(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
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

    const sectionIndex = Math.min(finalFace, availableSections.length) - 1;
    const targetSection = availableSections[sectionIndex];
    if (!targetSection) {
      setRollState("idle");
      return;
    }

    setLandedSection(targetSection.label);
    const messageKey = targetSection.href.replace("#", "") as keyof SiteContent["ui"]["dice"]["sectionMessages"];
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
        { transform: `translate(0px, 0px) rotate(${spinBase + 100}deg)` },
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
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
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

  useEffect(() => {
    const handleEasterEggRoll = () => {
      if (rollState !== "idle") return;
      if (!isOpen) {
        pendingAutoRollRef.current = true;
        setIsOpen(true);
        return;
      }
      void handleRoll();
    };

    window.addEventListener(EASTER_EGG_ROLL_EVENT, handleEasterEggRoll);
    return () => window.removeEventListener(EASTER_EGG_ROLL_EVENT, handleEasterEggRoll);
  }, [isOpen, rollState, handleRoll]);

  useEffect(() => {
    if (isOpen && pendingAutoRollRef.current) {
      pendingAutoRollRef.current = false;
      void handleRoll();
    }
  }, [isOpen, handleRoll]);

  return (
    <div className="pointer-events-none fixed left-3 top-20 z-[90]" aria-label={ui.ariaLabel}>
      {isOpen && landedSectionId && bubblePosition ? (
        <div
          className="fixed max-w-[320px] rounded-2xl border border-border-strong bg-surface/95 px-3 py-2 text-xs text-text-main shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-sm"
          style={{ left: `${bubblePosition.x}px`, top: `${bubblePosition.y}px` }}
        >
          <span className="block [font-family:var(--font-mono)] text-[10px] uppercase tracking-wide text-violet-glow">{landedSection}</span>
          <span>{ui.sectionMessages[landedSectionId]}</span>
        </div>
      ) : null}

      <div className="pointer-events-auto flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2 [font-family:var(--font-heading)] text-xs font-semibold text-text-main shadow-[0_8px_20px_-12px_rgba(62,123,250,0.8)] transition hover:-translate-y-0.5 hover:border-violet-glow"
        >
          {isOpen ? ui.toggleClose : ui.toggleOpen}
        </button>

        {isOpen ? (
          <div className="rounded-2xl border border-border-subtle bg-surface/95 p-3 backdrop-blur-sm">
            <div className="text-[11px] [font-family:var(--font-mono)] text-violet-glow">{ui.eyebrow}</div>
            <div className="mt-1 [font-family:var(--font-heading)] text-sm font-semibold text-text-main">{ui.heading}</div>
            <p className="mt-1 max-w-[34ch] text-xs text-text-muted">{ui.subheading}</p>
            <div className="mt-1 text-[11px] text-text-faint">{ui.clickHint}</div>
            <div className="mt-2 min-h-4 [font-family:var(--font-mono)] text-[11px] text-violet-glow">{landedSection ? `${ui.resultPrefix}: ${landedSection}` : ""}</div>
          </div>
        ) : null}

        {isOpen ? (
          <button
            ref={diceRef}
            type="button"
            onClick={handleRoll}
            disabled={rollState !== "idle"}
            className="grid h-20 w-20 grid-cols-3 gap-1.5 rounded-2xl border border-border-strong bg-surface p-2 shadow-[0_12px_36px_-16px_rgba(62,123,250,0.7)] disabled:cursor-not-allowed"
            aria-label={rollState === "rolling" ? ui.buttonRolling : ui.buttonIdle}
          >
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className={`rounded-full transition ${activePips.includes(index) ? "bg-gradient-to-br from-blue-glow to-violet-glow opacity-100" : "bg-surface-2 opacity-35"}`}
              />
            ))}
          </button>
        ) : null}
      </div>
    </div>
  );
}
