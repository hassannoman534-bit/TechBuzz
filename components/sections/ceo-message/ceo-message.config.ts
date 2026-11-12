/**
 * Message From CEO: content and motion constants.
 *
 * Copy rules: short lines, no dashes. Two limits when the placeholder message is
 * replaced with Usman's real words:
 *   - about 36 characters a line, or it wraps and the tilt doubles the wrapped line
 *   - six to eight lines. Every line has to finish its pass before the stage unpins.
 */

export type CeoMessageContent = {
  intro: { logoSrc: string; logoAlt: string; logoWidth: number; logoHeight: number; holdMs: number; reducedHoldMs: number };
  portrait: { src: string; alt: string; width: number; height: number };
  heading: { eyebrow: string; title: string; sub: string; cue: string };
  signature: { name: string; role: string; company: string };
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
    eyebrow: "Message from CEO",
    title: "Message from the CEO",
    sub: "On how TechBuzz started and where it is going.",
    cue: "Scroll",
  },
  signature: {
    name: "Usman Shabbir",
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
   * Extra distance past the block's own height, so the last line finishes its pass
   * and the stage is empty before it unpins. Without this the block stops centred
   * and the section drags the unfinished text upward.
   */
  exitPadVhRatio: 0.25,
  /**
   * Where the readable stretch ends. Up to here the block travels slowly through
   * the camera; after it, it leaves fast. A straight map spends most of the scroll
   * on text that has already receded to nothing.
   */
  readableUntil: 0.75,
  /** Fade the stage over the final stretch so nothing is visible when it unpins. */
  fadeStart: 0.85,
} as const;

/** Phase 2 portrait motion. */
export const PORTRAIT = {
  /** Enters from the right, travelling left and inward. */
  fromX: "22%",
  fromScale: 1.08,
  fromBlurPx: 14,
  durationS: 1.5,
  delayS: 0.1,
} as const;
