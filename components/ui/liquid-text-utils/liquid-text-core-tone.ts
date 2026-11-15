"use client";

import { useMemo } from "react";
import type { BjorkTone } from "./liquid-text-core-palette";

/**
 * Resolves the tone for LiquidText.
 *
 * The site is dark only, so an unset tone resolves to dark rather than reading
 * the OS preference. Passing a tone explicitly always wins.
 */
export function useBjorkTone(tone?: BjorkTone): BjorkTone {
  return useMemo<BjorkTone>(() => tone ?? "dark", [tone]);
}
