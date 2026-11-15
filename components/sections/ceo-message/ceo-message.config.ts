/**
 * Message From CEO: content and motion constants.
 *
 * Copy rules: short lines, no dashes. Two limits on the message block:
 *   - about 38 characters a line. Past that it wraps on a phone, and a wrapped
 *     line reads as two lines of different depth once the plane is tilted.
 *   - an empty string is a stanza break, not a line. It renders as space.
 */

export type CeoMessageContent = {
  intro: {
    logoSrc: string;
    logoAlt: string;
    logoWidth: number;
    logoHeight: number;
    holdMs: number;
    reducedHoldMs: number;
  };
  portrait: { src: string; alt: string; width: number; height: number };
  heading: {
    word: string;
    srHeading: string;
    sub: string;
    cue: string;
  };
  signoff: { salutation: string; name: string; role: string; company: string };
  message: { lines: string[] };
};

export const ceoMessage: CeoMessageContent = {
  intro: {
    logoSrc: "/assets/brand/techbuzz-logo-white.png",
    logoAlt: "TechBuzz",
    logoWidth: 2167,
    logoHeight: 1004,
    holdMs: 2400,
    reducedHoldMs: 900,
  },
  portrait: {
    src: "/assets/ceo/usman-shabbir-v2.webp",
    alt: "Usman Shabbir, Chief Executive Officer of TechBuzz",
    width: 1200,
    height: 1000,
  },
  heading: {
    /**
     * The liquid headline. One short word: the type is rasterised on a single
     * line and shrinks to fit, so anything past about ten characters goes small.
     * Alternatives that suit the message: Origins, Conviction, Our Why.
     */
    word: "Belief",
    /** Not shown. Carries the page for search engines and screen readers. */
    srHeading: "A message from Usman Shabbir, Chief Executive Officer of TechBuzz",
    sub: "The one idea this company was built around.",
    cue: "Scroll",
  },
  signoff: {
    salutation: "Best regards",
    /** Rendered as liquid type, so it stays on one line. */
    name: "Muhammad Usman",
    role: "Chief Executive Officer",
    company: "TechBuzz",
  },
  message: {
    lines: [
      "We began in 2019 with one belief.",
      "Marketing is not noise.",
      "It is clarity, repeated.",
      "",
      "Restaurants taught us the details.",
      "A full room is won in small things.",
      "The photograph. The wording. The hour.",
      "",
      "That lesson shaped everything after.",
      "We build brands, websites and software",
      "for owners who refuse to look average.",
      "",
      "The work has grown.",
      "The standard has not.",
      "Thank you for trusting us with it.",
    ],
  },
};

/** Site easing. Strong ease out: fast on entry, settles late. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Phase 3 stage geometry. Inline styles only, never Tailwind arbitrary values.
 *
 * Depth is built per line, from scale and translate, not from a CSS perspective
 * on the block. Chrome cannot map glyphs through a projective matrix exactly,
 * so it approximates the warp in chunks, and the chunks disagree: half of each
 * line renders sheared and the rest upright. Measured at this text size: clean
 * at 16deg of tilt, creeping back at 28, unmistakable at 45. That ceiling is
 * far too flat to read as three dimensional.
 *
 * Scale and translate are affine, so the browser applies them exactly and
 * re-rasterises the type at its new size. The result is a far stronger tunnel
 * than any tilt could give, and every line stays sharp at every size.
 */
export const STAGE = {
  heightVh: 260,
  /**
   * Virtual lens, as a share of viewport height. Each line is projected along
   * Y only: m = f / (f - v), where v is how far the line sits below the focal
   * line. 1.125 puts a line half a viewport below focus at about 1.8x.
   * Smaller = more aggressive.
   */
  lensVhRatio: 1.125,
  /** Where the tunnel's focal line sits, as a share of viewport height. */
  focusVhRatio: 0.46,
  /** Guards against the blow-up as a line approaches the lens. */
  scaleMin: 0.42,
  scaleMax: 2.3,
  /** Far lines dissolve rather than shrinking to an unreadable speck. */
  fadeBelowScale: 0.86,
  mobileMaxWidth: 640,
  /** Where the block starts, below and near the camera. */
  travelMinPx: 320,
  travelMaxPx: 560,
  travelVhRatio: 0.5,
  /**
   * Extra distance past the block's own height, so the last line finishes its
   * pass and the stage is empty before it unpins.
   */
  exitPadVhRatio: 0.14,
  /**
   * Where the readable stretch ends. Up to here the block travels slowly through
   * the camera; after it, it leaves fast.
   */
  readableUntil: 0.72,
  /**
   * Fade the stage over the final stretch. Every percent left between this and
   * 1 is a blank screen the reader has to scroll past before the sign off
   * arrives, so this was measured rather than guessed.
   */
  fadeStart: 0.97,
  /** Measure for the message column, in rem. Keeps the lines from running long. */
  measureRem: 52,
} as const;

/**
 * Hero portrait motion. He travels in from the right now, because the hero is
 * a split: type on the left, portrait on the right. The two live in separate
 * grid columns, so neither can grow into the other at any window size.
 */
export const PORTRAIT = {
  fromX: "18%",
  fromY: "3%",
  fromScale: 1.05,
  fromBlurPx: 16,
  durationS: 1.6,
  delayS: 0.2,
  /** Hover: the violet wash sweeps down his silhouette and he lifts slightly. */
  hoverScale: 1.028,
  hoverDurationS: 0.85,
  /** How far the wash travels inside the silhouette, as a share of its height. */
  hoverSweep: 42,
} as const;

/**
 * Shared settings for both liquid headlines.
 *
 * Montserrat 800 rather than Outfit: Outfit is only loaded at 500 and 600, and
 * heavy strokes are what give the surface enough body to read as liquid. The
 * team page already uses Montserrat for its giant words.
 */
export const LIQUID = {
  fontVar: "--font-montserrat",
  fontWeight: 800,
  ink: "#eef0f7",
  highlight: "#ffffff",
  /** Tint where ink has been pulled off a letter. Brand violet. */
  accent: "#7b61ff",
  viscosity: 0.58,
  trailLength: 8,
  /**
   * Headline size still tracks window height, so a short window never gets a
   * word taller than the space above the fold. The ratio and the ceiling are
   * both up from the centred draft: the word now owns its own column instead
   * of sharing the middle of the page with the portrait.
   */
  headlineVhRatio: 0.26,
  headlineMinPx: 88,
  headlineMaxPx: 264,
  /**
   * Below this width the surfaces are frozen: one representative frame, no
   * render loop. Raise it to 9999 to freeze everywhere if the live shader costs
   * too much on a real machine. The page keeps its look either way.
   */
  liveAbovePx: 640,
} as const;
