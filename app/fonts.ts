import localFont from "next/font/local";
import { Newsreader, Caveat, Lexend_Giga } from "next/font/google";

/** Display + UI sans: the closest match to the reference wordmark (heavy neo-grotesk). */
export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-pretendard",
});

/** Editorial serif for the small "( eyebrow ) / two-line" lockup above the word. */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-newsreader",
});

/** Handwriting for the pulled quote shown over the reveal frame. */
export const caveat = Caveat({ subsets: ["latin"], weight: ["500", "600"], display: "swap", variable: "--font-caveat" });

/** Ultra-thin giant word for the Impact Reveal section. */
export const lexendGiga = Lexend_Giga({ subsets: ["latin"], weight: ["200"], display: "swap", variable: "--font-lexend-giga" });
