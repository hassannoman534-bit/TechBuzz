/**
 * Layout, motion and filter tuning for /blog. Serializable: no functions, no
 * React. Post content never lives here. It comes from WordPress via lib/wp.ts.
 */

export const BLOG_COPY = {
  eyebrow: "( Insights )",
  title: "Notes from the work",
  sub: "What we are learning building brands, traffic and revenue for restaurants, retail and technology companies.",
  featuredTag: "Latest",
  empty: "No posts in this category yet.",
  emptyHint: "Try another topic, or read everything.",
  /** Shown only when the CMS itself could not be reached. */
  offline: "The archive is not responding",
  offlineHint:
    "WordPress did not answer in time. The posts are safe; this page just could not reach them.",
  ctaTitle: "Want this working for your brand?",
  ctaSub: "Tell us where you are stuck and we will tell you what we would do.",
  ctaAction: "Start a conversation",
  ctaHref: "/contact",
  backToBlog: "All insights",
  relatedTitle: "More on this",
  readMore: "Read",
} as const;

export const BLOG_FILTER = {
  /**
   * Categories below this post count are hidden. The live taxonomy is lopsided
   * (Blogs 133, SEO 34, Web Development 17, Graphic Design 7, Digital
   * Marketing 6, then a long tail at 1 or 2), so without a floor the bar grows
   * tabs that return a single post.
   */
  minCount: 5,
  /** Housekeeping terms, never shown as a filter. */
  excludeSlugs: ["uncategorized", "about"],
  allLabel: "All",
} as const;

export const BLOG_MOTION = {
  ease: [0.22, 1, 0.36, 1],
  /** Per-card entrance delay. Caps so a full grid never trails. */
  stagger: 0.05,
  staggerCap: 8,
  cardDuration: 0.6,
  /** Sibling cards dim to this while another is hovered. Fine pointers only. */
  dimOpacity: 0.42,
  /** Pointer-reactive rim on the featured card. */
  rimRadiusPx: 460,
  /** Maximum card tilt in degrees. Past about 7 it reads as a gimmick. */
  tiltDeg: 5.5,
} as const;

export const BLOG_GRID = {
  /** Featured image box. Inline styles, not Tailwind arbitrary values. */
  featuredMinHeightPx: 420,
  cardImageAspect: "16 / 10",
  wideImageAspect: "16 / 9",
  /** Article measure. Wider than prose defaults because the type is small. */
  articleMaxWidthCh: 68,
  /**
   * Magazine rhythm. Each run of five cards lays out as two wide then three
   * narrow, which fills two clean rows of a six column grid: 3+3, then 2+2+2.
   * Any other split leaves holes at the end of a row.
   */
  rhythm: 5,
  wideInRhythm: 2,
} as const;

/**
 * The WebGL plate field behind the masthead. Tuned for one draw call and a
 * fragment cost that a mid-range phone can carry at 60fps.
 */
export const BLOG_FIELD = {
  count: 90,
  countMobile: 34,
  /** Vertical wrap distance, in world units. */
  span: 17,
  drift: 0.1,
  near: 1.6,
  far: 12.5,
  opacity: 0.95,
  /** Radians of group rotation at full pointer deflection. */
  parallax: 0.09,
} as const;
