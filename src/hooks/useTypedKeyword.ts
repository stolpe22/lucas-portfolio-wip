import { useEffect, useRef } from "react";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useTypedKeyword(keyword: string, onMatch: () => void) {
  const bufferRef = useRef("");
  const callbackRef = useRef(onMatch);

  useEffect(() => {
    callbackRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    const target = keyword.toLowerCase();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.key.length !== 1) return;

      bufferRef.current = (bufferRef.current + event.key.toLowerCase()).slice(-target.length);

      if (bufferRef.current === target) {
        bufferRef.current = "";
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyword]);
}
