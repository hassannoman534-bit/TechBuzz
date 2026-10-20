"use client";

import { useEffect, useState } from "react";

/**
 * True for desktop pointers (mouse or trackpad with hover). Read after mount, so the server
 * and the first client render always match (false), then updates if the device changes.
 */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = (): void => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}
