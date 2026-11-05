import type { ArtRecipe } from "@/components/ui/glass-folder";
import type { ServiceIcon } from "./pricing.config";

/**
 * Glass folder look per pricing service: the liquid artwork painted on each folder's back panel.
 * All palettes stay inside the brand (void navy, violet, blue, ion, aurora) with one accent each.
 */
export const folderArt: Record<ServiceIcon, { art: ArtRecipe; seed: number }> = {
  smm: { seed: 3, art: { style: "marble", colors: ["#05060f", "#1b1450", "#7b61ff", "#0b1a33", "#22d8ff", "#d9d2ff"], scale: 0.7, warp: 3.2, angle: -0.5, gloss: 0.5, veins: 0.4 } },
  ads: { seed: 7, art: { style: "streak", colors: ["#05060f", "#16205a", "#5b7cff", "#22d8ff", "#0a1030", "#c9f4ff"], scale: 0.7, warp: 1.5, angle: -0.6, gloss: 0.25, veins: 0 } },
  content: { seed: 11, art: { style: "marble", colors: ["#04080a", "#0d2a2a", "#2cf5b0", "#0e1638", "#5b7cff", "#e6fff7"], scale: 0.72, warp: 3.4, angle: 0.8, gloss: 0.5, veins: 0.45 } },
  brand: { seed: 5, art: { style: "marble", colors: ["#07061a", "#2a1f5e", "#c9c2ff", "#120d2e", "#7b61ff", "#f3f0ff"], scale: 0.75, warp: 3.6, angle: 2.1, gloss: 0.55, veins: 0.5 } },
  ai: { seed: 19, art: { style: "streak", colors: ["#06051a", "#2b1a6b", "#9d8cff", "#0b2440", "#22d8ff", "#f0ecff"], scale: 0.65, warp: 1.6, angle: 0.35, gloss: 0.3, veins: 0 } },
  seo: { seed: 23, art: { style: "marble", colors: ["#030914", "#0b2a44", "#22a8ff", "#0a1430", "#2cf5b0", "#dff6ff"], scale: 0.7, warp: 3, angle: -1.2, gloss: 0.45, veins: 0.35 } },
  web: { seed: 29, art: { style: "streak", colors: ["#04050f", "#141c4d", "#5b7cff", "#7b61ff", "#0b0f2a", "#d4dcff"], scale: 0.7, warp: 1.4, angle: 0.9, gloss: 0.25, veins: 0 } },
  yt: { seed: 31, art: { style: "marble", colors: ["#07050c", "#2a0f24", "#ff4d6d", "#1a1240", "#7b61ff", "#ffd6de"], scale: 0.72, warp: 3.4, angle: 0.4, gloss: 0.5, veins: 0.45 } },
};

/** Shorter folder names where the pricing label is too long for the glass */
export const folderLabel: Partial<Record<ServiceIcon, string>> = {
  web: "Web & Automation",
};

export const pricingCopy = {
  eyebrow: "Pricing",
  title: "Build your plan",
  /** {t1} and {t2} become the bundle discounts from pricing.config.ts */
  sub: "Open a folder to see its packages. Your second service is {t1}% off, every service after that is {t2}% off.",
  empty: "Open a folder to start",
  review: "Review plan",
};
