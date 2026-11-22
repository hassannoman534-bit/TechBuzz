"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS font variable to a concrete family list.
 *
 * LiquidText and the belief letter both rasterise type through a 2D canvas, and
 * `ctx.font` cannot parse `var(--font-montserrat)`. next/font generates the real
 * family name at build time and only exposes it through that variable, so the
 * name has to be read off a probe element, where getComputedStyle does the
 * substitution.
 *
 * Returns undefined until it resolves. Render the static fallback until then,
 * otherwise the first rasterisation happens in the wrong typeface.
 *
 * ── Why this no longer waits on `document.fonts.ready` ──────────────────────
 *
 * It used to, and that was the reason the letter took two to three seconds to
 * appear. `document.fonts.ready` resolves only once *every* face the document
 * has asked for has settled, and since font-fix-v1 this site self hosts eleven
 * families. Waiting on the whole set to paint four of them meant the sheet was
 * gated on Pretendard and Lexend Giga, which it never uses.
 *
 * Two separate things were also being conflated:
 *
 *  1. Resolving the *name*. `getComputedStyle(probe).fontFamily` returns the
 *     computed font-family list, not the face actually in use, and custom
 *     property substitution happens at computed-value time. It does not depend
 *     on a single byte of font data having loaded, so it can be read on the
 *     first client tick. The old comment here claimed the probe would report
 *     the fallback it was swapped in for; it does not, because the swap happens
 *     at *used*-value time and is never visible to getComputedStyle.
 *
 *  2. Waiting for the *face*. This part is real: `ctx.font` silently falls back
 *     if the face has not loaded, and the letter's texture is painted once and
 *     cached, so a fallback paint is permanent. But only the handful of faces
 *     actually being painted have to be waited for, and `document.fonts.check`
 *     usually answers yes immediately on this page, because Syne is the global
 *     heading face and the rest are used above the fold.
 *
 * So: resolve the name now, wait only on the faces named by the caller, and
 * never wait longer than FACE_WAIT_MS for any of them.
 */

/**
 * Longest a face is waited for before painting anyway. A letter in a fallback
 * serif is worse than a letter that is late, but a letter that never arrives
 * because one woff2 404s is the worst of the three.
 */
const FACE_WAIT_MS = 1200;

/**
 * First family in a computed font-family list, unquoted.
 *
 * Only the first entry is a real face worth checking. next/font puts its own
 * generated name first and a metric matched fallback second, and
 * `FontFaceSet.check` against a list that ends in a generic family answers true
 * whatever has actually loaded, which would make the check useless.
 */
function primaryFamily(list: string): string {
  const first = list.split(",")[0]?.trim() ?? "";
  return first.replace(/^['"]|['"]$/g, "");
}

export function useResolvedFont(
  cssVar: string,
  /**
   * The faces this caller is going to paint, as CSS font shorthand without the
   * family: `"600 1rem"`, `"italic 400 1rem"`. Only list faces the family
   * actually declares. Newsreader here is a single upright variable file, so
   * asking for its italic would wait out the timeout every time and get a
   * synthesised oblique either way.
   */
  faces: readonly string[] = ["400 1rem"],
): string | undefined {
  const [family, setFamily] = useState<string>();
  // The array is a fresh literal on every render, so the effect keys off its
  // contents rather than its identity.
  const faceKey = faces.join("|");

  useEffect(() => {
    let cancelled = false;

    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;font-family:var(${cssVar}),sans-serif`;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).fontFamily;
    probe.remove();
    if (!resolved) return;

    const settle = (): void => {
      if (!cancelled) setFamily(resolved);
    };

    const set = document.fonts;
    if (!set) {
      settle();
      return;
    }

    const specs = faceKey.split("|").map((face) => `${face} "${primaryFamily(resolved)}"`);

    const loaded = specs.every((spec) => {
      try {
        return set.check(spec);
      } catch {
        // An unparseable shorthand throws here. Treat it as not loaded and let
        // the load path below deal with it.
        return false;
      }
    });
    if (loaded) {
      settle();
      return;
    }

    const timer = window.setTimeout(settle, FACE_WAIT_MS);
    void Promise.all(specs.map((spec) => set.load(spec).catch(() => undefined))).then(
      settle,
      settle,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cssVar, faceKey]);

  return family;
}
