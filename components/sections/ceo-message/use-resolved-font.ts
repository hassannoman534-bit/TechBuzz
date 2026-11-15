"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS font variable to a concrete family list.
 *
 * LiquidText rasterises the word through a 2D canvas, and `ctx.font` cannot parse
 * `var(--font-montserrat)`. next/font generates the real family name at build
 * time and only exposes it through that variable, so the name has to be read off
 * a probe element, where getComputedStyle does the substitution.
 *
 * Returns undefined until it resolves. Render the static fallback until then,
 * otherwise the first rasterisation happens in the wrong typeface.
 */
export function useResolvedFont(cssVar: string): string | undefined {
  const [family, setFamily] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    const resolve = (): void => {
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;font-family:var(${cssVar}),sans-serif`;
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe).fontFamily;
      probe.remove();
      if (!cancelled && resolved) setFamily(resolved);
    };

    // Waiting on the font set first means the probe reports the loaded face
    // rather than the fallback it was swapped in for.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(resolve, resolve);
    } else {
      resolve();
    }

    return () => {
      cancelled = true;
    };
  }, [cssVar]);

  return family;
}
