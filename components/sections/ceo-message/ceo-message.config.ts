/**
 * Message From CEO: content and motion constants.
 *
 * Copy rules: short lines, no dashes. Two limits when the placeholder message is
 * replaced with Usman's real words:
 *   - about 36 characters a line, or it wraps and the tilt doubles the wrapped line
 *   - six to eight lines. Every line has to finish its pass before the stage unpins.
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
    eyebrow: string;
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
    src: "/assets/ceo/usman-shabbir.webp",
    alt: "Usman Shabbir, Chief Executive Officer of TechBuzz",
    width: 1200,
    height: 1245,
  },
  heading: {
    eyebrow: "Est. 2019, Lahore",
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
      "We started in 2019 with one belief.",
      "Marketing is not noise.",
      "It is clarity, repeated.",
      "Restaurants taught us the details.",
      "Now we build brands and software.",
      "The standard has not moved.",
    ],
  },
};

/** Site easing. Strong ease out: fast on entry, settles late. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Phase 3 stage geometry. Inline styles only, never Tailwind arbitrary values. */
export const STAGE = {
  heightVh: 300,
  perspectivePx: 200,
  /** Phones get a longer lens. At 200px the near plane clips lines mid word. */
  perspectivePxMobile: 460,
  mobileMaxWidth: 640,
  /** Where the block starts, below and near the camera. */
  travelMinPx: 360,
  travelMaxPx: 620,
  travelVhRatio: 0.62,
  /**
   * Extra distance past the block's own height, so the last line finishes its
   * pass and the stage is empty before it unpins.
   */
  exitPadVhRatio: 0.25,
  /**
   * Where the readable stretch ends. Up to here the block travels slowly through
   * the camera; after it, it leaves fast.
   */
  readableUntil: 0.75,
  /** Fade the stage over the final stretch so nothing is visible when it unpins. */
  fadeStart: 0.85,
} as const;

/** Hero portrait motion. Rises and comes inward, because the hero is centred. */
export const PORTRAIT = {
  fromY: "9%",
  fromScale: 1.07,
  fromBlurPx: 14,
  durationS: 1.5,
  delayS: 0.25,
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
   * Below this width the surfaces are frozen: one representative frame, no
   * render loop. Raise it to 9999 to freeze everywhere if the live shader costs
   * too much on a real machine. The page keeps its look either way.
   */
  liveAbovePx: 640,
} as const;
