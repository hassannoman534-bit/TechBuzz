export type ProofVisual = "bars" | "line" | "count" | "stars";

export type ProofStat = {
  label: string;
  /** Numeric value — animated (counted up) on scroll */
  value: number;
  /** Decimals to show while counting */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  caption: string;
  visual: ProofVisual;
  /** Position along the word track, 0–100 (% of track width) */
  at: number;
  /** Vertical placement: "top" floats above the letters, "bottom" below */
  lane: "top" | "bottom";
  /** Parallax: >1 moves faster than the word, <1 slower */
  speed: number;
};

export type ImpactRevealContent = {
  eyebrow: string;
  /** Giant word that travels horizontally across the light */
  word: string;
  stats: ProofStat[];
  cta: {
    eyebrow: string;
    headline: string;
    body: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
};

/** Replace the stat values with your real, verified numbers. */
export const impactRevealContent: ImpactRevealContent = {
  eyebrow: "( Ready to grow? )",
  word: "IMPOSSIBLE TO IGNORE",
  stats: [
    { label: "Avg. ROAS", value: 4.8, decimals: 1, suffix: "×", caption: "across paid campaigns", visual: "bars", at: 8, lane: "top", speed: 1.12 },
    { label: "SEO traffic", value: 312, prefix: "+", suffix: "%", caption: "in 6 months", visual: "line", at: 34, lane: "bottom", speed: 0.9 },
    { label: "Projects delivered", value: 150, suffix: "+", caption: "since 2019", visual: "count", at: 58, lane: "top", speed: 1.08 },
    { label: "Client rating", value: 10, decimals: 0, suffix: "/10", caption: "avg satisfaction", visual: "stars", at: 80, lane: "bottom", speed: 0.92 },
  ],
  cta: {
    eyebrow: "( Your brand is next )",
    headline: "Let's make yours impossible to ignore.",
    body: "From strategy to execution, the full stack of digital growth for ambitious brands.",
    primary: { label: "Book a free strategy call", href: "/contact" },
    secondary: { label: "See our work", href: "/portfolio" },
  },
};
