/**
 * The work ribbon on the portfolio page.
 *
 * A strip of client screenshots bent around a helix, rising through a pinned
 * stage and spinning past as the page scrolls. Ported from a 21st.dev component
 * (kedhareswer/helix-ribbon-hero), reduced to the ribbon alone: the original is
 * a whole hero with a letter by letter headline, a portrait, a nav, a bio and a
 * closing grid, none of which this page wants or has room for.
 *
 * ── What the geometry means ─────────────────────────────────────────────────
 *
 * Each card is cut into `slices` vertical strips, and each strip is rendered
 * twice, front and back. The strips are placed around a cylinder of radius R at
 * increasing angle, each one descending by a fraction of `pitch`, and skewed by
 * the angle between its own width and that descent so neighbours meet flush.
 * That is what turns a row of flat divs into one continuous bent surface.
 *
 * R is not a free number: it falls out of `cardWidth` and `perTurn`, because a
 * turn has to be exactly `perTurn` cards around. Change either and the radius
 * follows.
 */

export type RibbonWork = {
  /** 3:2 image in /public. Anything else is stretched: the slice background is
   *  sized explicitly, so a 16:9 source would be squashed into a 3:2 card. */
  src: string;
  /** Drawn under the card in the landing grid. */
  title: string;
  /** Alt text. The ribbon itself is decorative; the landing grid is content. */
  alt: string;
};

export const RIBBON = {
  /** Master switch. False drops the section without touching the page. */
  enabled: true,

  /**
   * Screen heights of scroll the ribbon takes, on top of the pinned stage.
   * The section ends up (screens + 1) stage heights tall.
   */
  screens: 3,

  /**
   * Cards per full turn of the helix.
   *
   * The upstream default is 7, tuned for the twelve cards it ships with. With
   * eight the ribbon would be barely over one turn and read as a flat strip
   * that happens to be bent, so this is tightened to six: the same eight cards
   * now make a third of a turn more, and the curvature is visible rather than
   * implied.
   */
  perTurn: 6,
  /** Vertical strips per card, per face. Each one is a composited layer, so
   *  this is the layer count knob: 8 cards at 4 slices is 64 divs. */
  slices: 4,
  /** A turn's descent, in card heights. */
  pitch: 1.34,
  /** The whole ribbon's lean, degrees. */
  tiltZ: -17,
  tiltX: -9,

  /** When the ribbon enters and leaves, as a fraction of the pin. */
  phase: [0.04, 0.62] as [number, number],

  /**
   * The landing grid: where the work comes to rest once the ribbon has gone.
   *
   * The cards start arriving at 0.53, while the ribbon's tail is still leaving
   * at 0.62. That overlap is deliberate and is why the two read as one
   * movement rather than as a ribbon, a pause, and then a grid.
   *
   * `stagger` is 26ms of scroll per card, inside the 30 to 50ms band the
   * ui-ux-pro-max motion rules give for grid entrances, and the same rules cap
   * a stagger at about eight children, which is exactly how many there are.
   */
  grid: {
    land: [0.53, 0.63] as [number, number],
    stagger: 0.026,
    /**
     * Panning the landed grid to its resting place.
     *
     * Starts at 0.84, not the upstream 0.8. With eight cards the stagger runs
     * to 0.812, and at 0.8 the eighth card was still flying in while the grid
     * had already begun moving under it, so that one card never settled into
     * the same frame as the other seven.
     */
    settle: [0.84, 1] as [number, number],
    /**
     * Columns by stage width. Four across on a wide screen is what makes the
     * eight fit on one screen at the end: at three they need two and a half
     * rows and the grid has to pan a long way to show the last of them.
     */
    colsWide: 4,
    colsMid: 3,
    colsNarrow: 2,
    wideAbovePx: 1280,
    midAbovePx: 720,
    /** Height reserved under each card for its caption. */
    capRowPx: 26,
  },

  /**
   * Hover, by the ui-ux-pro-max motion rules.
   *
   * Scale only, on the image inside a fixed frame, so nothing reflows: the
   * rules are explicit that hover must not touch layout-affecting properties
   * and must not cause a shift. 1.045 sits inside the 0.95 to 1.05 band those
   * rules give for scale feedback.
   *
   * The leave is quicker than the enter, at about 64% of it, which is the
   * exit-faster-than-enter rule. Both are plain CSS transitions rather than
   * JS, so an interrupted hover retargets from wherever it got to instead of
   * restarting, which is the cancellable-state-transitions rule.
   */
  hover: {
    scale: 1.045,
    enterMs: 280,
    exitMs: 180,
    pressScale: 1.012,
  },

  /**
   * How hard the ribbon's travel is smoothed, in ms.
   *
   * Lenis is already smoothing the scroll, so this is deliberately lighter than
   * the upstream 110: at that value the two filters stack and the ribbon lags
   * noticeably behind the page.
   */
  easeMs: 60,

  /** Darkest a strip gets as it turns away from the viewer. */
  shadeFloor: 0.66,

  /**
   * The work. Eight of the old portfolio's website mockups, the only images in
   * `assets/folio/15_webfolio` that are screenshots rather than the pill
   * buttons the old WordPress page used for navigation.
   *
   * Flattened onto a card colour rather than left transparent: the sources are
   * cut-out device mockups on alpha, and on alpha the ribbon has no surface,
   * so the strips, the seams and the shading that give it its form all vanish
   * and it reads as unrelated laptops tumbling through the dark.
   *
   * TODO Malik: these are named by position because the filenames in the old
   * export do not say whose site each one is. Rename them to the real clients
   * and put the names in `alt` when you have them.
   */
  work: [
    { src: "/assets/portfolio/ribbon/work-01.webp", title: "Client site 01", alt: "Client website design, one" },
    { src: "/assets/portfolio/ribbon/work-02.webp", title: "Client site 02", alt: "Client website design, two" },
    { src: "/assets/portfolio/ribbon/work-03.webp", title: "Client site 03", alt: "Client website design, three" },
    { src: "/assets/portfolio/ribbon/work-04.webp", title: "Client site 04", alt: "Client website design, four" },
    { src: "/assets/portfolio/ribbon/work-05.webp", title: "Client site 05", alt: "Client website design, five" },
    { src: "/assets/portfolio/ribbon/work-06.webp", title: "Client site 06", alt: "Client website design, six" },
    { src: "/assets/portfolio/ribbon/work-07.webp", title: "Client site 07", alt: "Client website design, seven" },
    { src: "/assets/portfolio/ribbon/work-08.webp", title: "Client site 08", alt: "Client website design, eight" },
  ] satisfies RibbonWork[],
} as const;
