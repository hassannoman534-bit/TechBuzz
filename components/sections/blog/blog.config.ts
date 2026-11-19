/**
 * Layout and filter tuning for /blog. Serializable: no functions, no React.
 * Post content never lives here. It comes from WordPress via lib/wp.ts.
 */

export const BLOG_COPY = {
  eyebrow: "( Insights )",
  title: "Notes from the work",
  sub: "What we are learning building brands, traffic and revenue for restaurants, retail and technology companies.",
  featuredTag: "Latest",
  empty: "No posts in this category yet.",
  /** Shown only when the CMS itself could not be reached. */
  offline: "Posts are not loading right now. Please try again shortly.",
  ctaTitle: "Want this working for your brand?",
  ctaSub: "Tell us where you are stuck and we will tell you what we would do.",
  ctaAction: "Start a conversation",
  ctaHref: "/contact",
  backToBlog: "All insights",
  relatedTitle: "More on this",
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
  dimOpacity: 0.45,
  /** Pointer-reactive rim on the featured card. */
  rimRadiusPx: 420,
} as const;

export const BLOG_GRID = {
  /** Featured image box. Inline styles, not Tailwind arbitrary values. */
  featuredMinHeightPx: 300,
  cardImageAspect: "16 / 10",
  /** Article measure. Wider than prose defaults because the type is small. */
  articleMaxWidthCh: 68,
  /**
   * Cards in the first grid row load eagerly. At xl the grid is three across,
   * and on a filtered or paged view there is no featured post above it, so
   * those three are the above-the-fold images and the LCP candidate. Leaving
   * them lazy makes next/image warn that the LCP image is lazy-loaded.
   */
  eagerCards: 3,
} as const;
