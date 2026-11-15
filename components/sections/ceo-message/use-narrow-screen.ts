"use client";

import { useEffect, useState } from "react";

/**
 * True on narrow screens.
 *
 * Both liquid surfaces are frozen there: the component renders one representative
 * frame with a bead mid-pull and stops. Phones get the look with no render loop
 * and no third of a second of shader compile, and the drag interaction the
 * animation exists for is a pointer gesture anyway.
 */
export function useNarrowScreen(maxWidth = 640): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = (): void => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidth]);

  return narrow;
}
