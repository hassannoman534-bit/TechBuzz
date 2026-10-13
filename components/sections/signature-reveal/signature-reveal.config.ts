export type SignatureImage = {
  /** Landscape master, 16:9 (2400×1350), pre-optimised WebP in /public */
  src: string;
  /** Optional 9:16 version (1080×1920), used when the screen is portrait */
  srcMobile?: string;
  alt: string;
};

export type SignatureLogo = {
  /** Brand logo for the opening beat — SVG preferred, or a transparent PNG/WebP. Light version for dark backgrounds. */
  src: string;
  alt: string;
};

export type SignatureRevealContent = {
  intro: string;
  /** The word is split around the bracketed letter: before + ( letter ) + after */
  word: { before: string; letter: string; after: string };
  eyebrow: string;
  serifLines: [string, string];
  subtitle: string;
  /** Image A — the card that grows full-size behind the quote. 16:9 + optional 9:16. */
  image: SignatureImage;
  /** Image B — crossfades in as the frame shrinks; also fills the letter during the morph. Subject centred. */
  detailImage: SignatureImage;
  /** Logo revealed inside the card before the quote. Omit to show a "TechBuzz" wordmark instead. */
  logo?: SignatureLogo;
  /** One-liner shown over image A at full size. Optional. */
  quote?: string;
};

export const signatureRevealContent: SignatureRevealContent = {
  intro:
    "TechBuzz builds brands, platforms and campaigns for companies that would rather be talked about than scrolled past.",
  word: { before: "RES", letter: "O", after: "NANCE" },
  eyebrow: "( TechBuzz — Since 2019 )",
  serifLines: ["Digital Agency", "Lahore, Worldwide"],
  subtitle: "Brands people can't stop talking about.",
  quote: "Attention is rented. Resonance is owned.",
  logo: { src: "/images/techbuzz-logo.png", alt: "TechBuzz" },
  image: {
    src: "/images/sig-aura.webp",
    srcMobile: "/images/sig-aura-mobile.webp",
    alt: "",
  },
  detailImage: {
    src: "/images/sig-orb.webp",
    srcMobile: "/images/sig-orb-mobile.webp",
    alt: "",
  },
};
