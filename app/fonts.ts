import localFont from "next/font/local";

/**
 * All display and body fonts are self-hosted via @fontsource's variable
 * woff2 files, through next/font/local rather than next/font/google.
 *
 * next/font/google needs to reach fonts.googleapis.com at build time
 * (through Turbopack's own font-fetching module, not the app's own network
 * stack) to resolve the face. On a host where that request is slow, blocked,
 * or rate-limited, Turbopack fails the build with "Module not found: Can't
 * resolve '@vercel/turbopack-next/internal/font/google/font'" — the font
 * name in the stack trace is whichever face Turbopack happened to reach
 * first, not necessarily the one actually at fault. The fix is not to depend
 * on that request existing at all. Self-hosting also means these faces are
 * served from the same origin as the rest of the site rather than from
 * Google's CDN, so there is one fewer third-party connection on every page
 * load.
 *
 * Do not move any of these back to next/font/google.
 */

/** Display + UI sans: the closest match to the reference wordmark (heavy neo-grotesk). */
export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-pretendard",
});

/** Editorial serif for the small "( eyebrow ) / two-line" lockup above the word. */
export const newsreader = localFont({
  src: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-newsreader",
});

/** Handwriting for the pulled quote shown over the reveal frame. Static family: only 500/600 are used. */
export const caveat = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/caveat/files/caveat-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff2",
      weight: "600",
    },
  ],
  display: "swap",
  variable: "--font-caveat",
});

/** Ultra-thin giant word for the Impact Reveal section. */
export const lexendGiga = localFont({
  src: "../node_modules/@fontsource-variable/lexend-giga/files/lexend-giga-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-lexend-giga",
});

/** Footer giant wordmark (heavy neo-grotesk display). */
export const outfit = localFont({
  src: "../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-outfit",
});

/** Footer UI/body text. */
export const interTight = localFont({
  src: "../node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter-tight",
});

/** Our Team: giant masked names and designations (heavy weights only). */
export const montserrat = localFont({
  src: "../node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-montserrat",
});
