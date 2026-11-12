/**
 * Message From CEO page content and motion constants.
 *
 * Copy rules: short lines, no dashes, nothing that wraps awkwardly in the 3D stage.
 * Each line in `message.lines` is its own block in the perspective scroll. Two limits
 * to respect when this placeholder is replaced with Usman's real words:
 *   - about 36 characters a line, or it wraps and the tilt doubles the wrapped line
 *   - six lines, because the block has to land inside one viewport at 1536x700
 */

export type CeoMessageContent = {
  intro: {
    /** Logo shown in the opening overlay. White on transparent reads best on #030712. */
    logoSrc: string;
    logoAlt: string;
    /** Intrinsic size of the file, used so next/image never guesses. */
    logoWidth: number;
    logoHeight: number;
    /** How long the logo holds before it fades out, in milliseconds. */
    holdMs: number;
    /** Shorter hold when the visitor asked for reduced motion. */
    reducedHoldMs: number;
  };
  heading: {
    eyebrow: string;
    title: string;
    sub: string;
    cue: string;
  };
  message: {
    lines: string[];
  };
  signature: {
    name: string;
    role: string;
    company: string;
  };
};

export const ceoMessage: CeoMessageContent = {
  intro: {
    logoSrc: "/assets/brand/techbuzz-logo-white.png",
    logoAlt: "TechBuzz",
    logoWidth: 2167,
    logoHeight: 1004,
    holdMs: 2500,
    reducedHoldMs: 900,
  },
  heading: {
    eyebrow: "Message from CEO",
    title: "Message from the CEO",
    sub: "Usman Shabbir on how TechBuzz started and where it is going.",
    cue: "Scroll",
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
  signature: {
    name: "Usman Shabbir",
    role: "Chief Executive Officer",
    company: "TechBuzz",
  },
};

/** Shared easing for the page. Matches the rest of the site. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Phase 3 stage geometry. These are set as inline styles, never Tailwind arbitrary
 * values, because arbitrary values have been dropped in production builds before.
 */
export const STAGE = {
  /** Total scroll length of the pinned section. */
  heightVh: 300,
  /** Camera distance. Lower is a harder tilt. 200px matches the reference. */
  perspectivePx: 200,
  /**
   * Phones get a longer lens. At 200px on a 390 wide screen the near plane
   * magnifies so hard that lines clip mid word on both edges.
   */
  perspectivePxMobile: 460,
  /** Width at or below which the mobile lens is used. */
  mobileMaxWidth: 640,
  /** Tilt of the text plane. */
  rotateXDeg: 30,
  /** Lift off the tilted plane so the first line clears the floor. */
  translateZPx: 10,
  /** Travel of the text through the camera, clamped per viewport height. */
  travelMinPx: 360,
  travelMaxPx: 620,
  travelVhRatio: 0.62,
} as const;
