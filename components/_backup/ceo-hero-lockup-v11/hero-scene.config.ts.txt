/**
 * The cinematic hero: three layers at three depths.
 *
 * Composition, back to front:
 *   1. environment, a dark ridgeline with violet and blue ambient,
 *   2. the existing LiquidText word, enlarged, holding the left,
 *   3. the full body cutout, standing to the right, in front of the word.
 *
 * Parallax rule: nearer moves further. Scrolling down drives everything up,
 * so the figure takes the largest negative travel, the word less, the
 * environment least. Scale follows the same logic in reverse, the figure
 * growing very slightly while the word recedes, which reads as the camera
 * moving into the scene rather than the page sliding under a flat picture.
 *
 * Everything here is transform and opacity. No new dependency, no second
 * smooth scroll instance, no scroll listener doing React state. The page's
 * existing Lenis stays the only one.
 */

/** Travel as a share of the layer's own height, at the end of the hero. */
export const PARALLAX = {
  /** Farthest. Barely moves, grows a touch, so the backdrop feels held. */
  environment: { y: -6, scale: 1.07 },
  /** The word sits deeper than the figure, so it travels less. */
  word: { y: -17, scale: 0.94 },
  /** Nearest. Largest travel and a slight gain, which sells the depth. */
  figure: { y: -29, scale: 1.05 },
  /** The kicker line clears out early, before it can reach the navbar pill. */
  kicker: { y: -22, fadeBy: 0.34 },
  /**
   * Mobile runs the same scene at roughly a third of the travel. The full
   * distances on a 390 wide screen move the figure far enough to leave the
   * composition before the hero has finished scrolling.
   */
  mobileScale: 0.34,
} as const;

/**
 * The figure.
 *
 * Anchored to the bottom of the hero and sized from viewport height, because
 * a standing person is read by height, not width. Width follows from the
 * asset's own ratio, which is why the file is trimmed to his silhouette: any
 * transparent margin baked into the image would offset this positioning.
 */
export const FIGURE = {
  src: "/assets/ceo/usman-shabbir-full.webp",
  /** Intrinsic, after trimming to the alpha bounding box. */
  intrinsicW: 774,
  intrinsicH: 1400,
  /** Height as a share of the hero, wide screens then stacked. */
  heightVh: 0.82,
  heightVhMobile: 0.6,
  /**
   * Distance from the right edge of the hero, as a share of its width.
   *
   * Tuned against a centred word. He stands over its last letter: far enough
   * in to be unmistakably in front of the type, not so far that he splits the
   * word into two unreadable halves. At 7 he cleared it entirely with 261px of
   * gap, which was the old two column hero wearing a backdrop.
   */
  rightPct: 3,
  rightPctMobile: 0,
  /** Entrance. He arrives from the right and settles. */
  fromX: "9%",
  fromScale: 1.04,
  durationS: 1.5,
  delayS: 0.25,
  /** Hover, carried over from the portrait it replaces. */
  hoverScale: 1.015,
  hoverSweep: 62,
  hoverDurationS: 0.85,
} as const;

/**
 * The word.
 *
 * Bigger than the split hero it replaces, because it is the centrepiece of the
 * scene now rather than one column of two. It still tracks window height so a
 * short window never gets a word taller than the space it has, and LiquidText
 * shrinks it again to fit the box, so these are ceilings and not promises.
 *
 * Held left rather than centred. Centred, the figure covered the middle of the
 * word and what was left read as two fragments; held left, he crosses only its
 * last letter and the whole word still reads.
 */
export const HERO_WORD = {
  /**
   * The height ceiling. It only binds on a short wide window, where a word
   * sized purely by width would be taller than the room above the fold.
   */
  vhRatio: 0.47,
  minPx: 92,
  maxPx: 420,
  /**
   * Share of the padded row the word's box may occupy.
   *
   * This is the real size control, not the font size. LiquidText sets its own
   * font from the box, filling 82% of whatever width it is given, and only
   * falls back to the ceiling above when that would be too tall. The box is
   * centred in the hero and the word is centred in the box, so this decides
   * how far the last letter reaches toward the figure.
   */
  boxWidthPct: 91,
  boxWidthPctMobile: 92,
  /** Pushed up off centre so the figure's torso crosses it, not his face. */
  offsetYPct: -6,
  /**
   * Zero, because stacked the column is anchored to the top of the hero rather
   * than centred in it. Nudging a centred column upward by a percentage of its
   * own height was the first attempt and it does not survive a copy change:
   * the percentage is of the column, so the word lands somewhere different the
   * moment the kicker wraps to another line.
   */
  offsetYPctMobile: 0,
} as const;

/**
 * Environment.
 *
 * Gradients and two SVG ridges. Deliberately not WebGL: the page already
 * carries a shader for the word and another for the sign off, and a backdrop
 * is exactly the kind of thing that should cost nothing.
 */
export const ENVIRONMENT = {
  /** Ambient pools. Brand violet left and high, tech blue right and lower. */
  violet: "rgba(123,97,255,0.2)",
  blue: "rgba(91,124,255,0.15)",
  /** Haze sitting along the ridgeline. */
  haze: "rgba(123,97,255,0.09)",
  /**
   * Ridge fills, far to near. Each is a shade off the page black.
   *
   * There are no rim colours here any more. The ridges carried a one pixel
   * lit edge at first and it made them read as a line chart rather than as
   * landform, so they are drawn as unoutlined shapes.
   */
  ridgeFar: "#0a0f22",
  ridgeNear: "#050913",
} as const;
