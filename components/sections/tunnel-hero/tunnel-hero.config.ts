export type TunnelCard = {
  /** Small caption on the card, e.g. the project name */
  label: string;
  /** Image in /public (any ratio, it is cropped to the card). Leave out for a brand gradient placeholder. */
  src?: string;
  /** Placeholder gradient [from, to] when there is no image */
  tint?: [string, string];
};

export type TunnelHeroContent = {
  eyebrow: string;
  /** Headline, one string per line (2 lines like the reference) */
  lines: string[];
  sub: string;
  /** Small cue at the bottom */
  cue: string;
  cards: TunnelCard[];
};

export const tunnelHeroContent: TunnelHeroContent = {
  eyebrow: "( Brand · Build · Growth )",
  lines: ["Brands & experiences", "worth remembering."],
  sub: "Strategy, design, engineering and growth marketing for restaurants, retail and technology brands. Lahore to worldwide, since 2019.",
  cue: "Scroll to explore",
  // 14 cards fly through the corridor. Replace with real work images (portrait or square crops look best).
  cards: [
    { label: "Sultan Yakhni Pulao", src: "/assets/portfolio/sultan-yakhni-pulao.webp" },
    { label: "FoodBuzz", tint: ["#251d5c", "#7b61ff"] },
    { label: "SHAFAQ Surgical", tint: ["#0f3242", "#22a8ff"] },
    { label: "Qissah", tint: ["#0f3a2e", "#2cf5b0"] },
    { label: "Branding", tint: ["#2a1840", "#c86bff"] },
    { label: "Social Media", tint: ["#13223f", "#5b7cff"] },
    { label: "Web Development", tint: ["#0e2e2a", "#22d8ff"] },
    { label: "Paid Ads", tint: ["#30121f", "#ff5a8a"] },
    { label: "Content Production", tint: ["#2b1d12", "#ffb347"] },
    { label: "SEO", tint: ["#122a1c", "#2cf5b0"] },
    { label: "AI Content", tint: ["#1d1846", "#22d8ff"] },
    { label: "YouTube", tint: ["#30121a", "#ff4d4d"] },
    { label: "App Development", tint: ["#13223f", "#7b61ff"] },
    { label: "Product Photography", tint: ["#2a2410", "#e8c26b"] },
  ],
};

/**
 * Depth of field for the corridor.
 *
 * Two jobs, and the second one matters more than it looks. The cards and the
 * headline are planes in one preserve-3d context, and a card is rotated up to
 * 24deg off the headline's plane, so the two intersect geometrically and the
 * browser splits them along the intersection line. That is the razor cut
 * through the glyphs: correct depth sorting, wrong looking.
 *
 * Giving a card a filter puts it on its own render surface, and a render
 * surface is composited as one flat quad at one depth instead of being split
 * against other planes. So the blur removes the intersection as well as
 * softening the edge that does the occluding.
 *
 * Blur is quantised because a changed filter string re-rasterises the card.
 * At 0.5px steps a card re-rasterises on the order of thirty times across the
 * whole fly-through instead of on every frame.
 */
export const TUNNEL_DOF = {
  /** Where the blur starts picking up, in z. Behind the headline (z=0) on
   *  purpose: a card crossing the headline's own depth already carries a few
   *  px, which hides the moment its sort order flips. */
  nearFrom: -200,
  nearSpan: 620,
  nearMaxBlurPx: 15,
  /** Near cards darken so a huge foreground card does not blow out the page. */
  nearMaxDim: 0.3,
  /** Atmospheric softening at the far end, on top of the existing fog fade. */
  farFrom: -1200,
  farSpan: 1500,
  farMaxBlurPx: 3,
  /** Rounded to this many px. Fewer distinct strings, fewer re-rasters. */
  stepPx: 0.5,
  /** Below this, no filter at all rather than a filter that does nothing. */
  minPx: 0.35,
} as const;

/**
 * How the headline answers a card passing through it. Transform only: a filter
 * here would re-rasterise live text every frame and flatten the block.
 */
export const TUNNEL_PRESSURE = {
  /** Depth band either side of the headline that counts as a pass-through. */
  bandZ: 760,
  /** Padding around the headline box counted as an overlap, in px. */
  padPx: 90,
  /** Peak recoil. Small on purpose, it reads as weight rather than wobble. */
  maxScaleDrop: 0.014,
  maxPushPx: 7,
  /** Smoothing on the pressure value so a card entering the band is not a step. */
  lerp: 0.12,
} as const;

/** The sub paragraph clears out on scroll, once its entrance has finished. */
export const TUNNEL_SUB = {
  fadeFrom: 0.02,
  fadeTo: 0.18,
  risePx: -26,
} as const;
