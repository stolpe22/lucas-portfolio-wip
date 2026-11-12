import { useCallback, useEffect, useRef, useState } from "react";

/**
 * For a list that scrolls inside its own box: how many rows are still fully below the
 * visible area. Updates on scroll, resize and when the rows change; 0 when the end is visible.
 * Rows are the direct children marked with [data-row].
 */
export function useMoreBelow<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T | null>(null);
  const [count, setCount] = useState(0);

  const measure = useCallback(() => {
    const box = ref.current;
    if (!box) return;
    const bottom = box.getBoundingClientRect().bottom;
    let below = 0;
    box.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
      if (row.getBoundingClientRect().top >= bottom - 4) below += 1;
    });
    setCount(below);
  }, []);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    measure();
    box.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => {
      box.removeEventListener("scroll", measure);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  return { ref, count };
}
