/**
 * Tone palette for LiquidText.
 *
 * TechBuzz runs strict dark mode, so `dark` is the one that matters. `light` is
 * kept so the component's own API stays whole if it is reused elsewhere.
 */

export type BjorkTone = "light" | "dark";

export interface BjorkPalette {
  /** Default ink colour when no `color` prop is given. */
  text: string;
  /** Secondary type sitting next to the liquid word. */
  muted: string;
  /** The surface the type is read against. */
  surface: string;
}

export const BJORK_PALETTE: Record<BjorkTone, BjorkPalette> = {
  dark: {
    text: "#eef0f7",
    muted: "rgba(255,255,255,0.45)",
    surface: "#030712",
  },
  light: {
    text: "#0b0d14",
    muted: "rgba(3,7,18,0.55)",
    surface: "#f6f6f8",
  },
};
