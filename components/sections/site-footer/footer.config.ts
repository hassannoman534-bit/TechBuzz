import type { SocialIconName } from "./social-icons";

export type FooterLink = { label: string; href: string };
export type FooterSocial = { label: string; href: string; icon: SocialIconName; /** brand RGB triplet for the hover glow */ rgb: string };

export type FooterContent = {
  eyebrow: string;
  /** Handwritten headline. The `highlight` word gets the gradient and the drawn underline. */
  tagline: { before: string; highlight: string; after: string };
  email: string;
  phones: { label: string; display: string; href: string }[];
  whatsapp: { label: string; href: string };
  nav: FooterLink[];
  studio: { label: string; lines: string[]; mapHref: string; timeZone: string; zoneLabel: string };
  socials: FooterSocial[];
  copyright: { since: number; name: string; suffix: string };
  wordmark: string;
  /** The big round button on the divider */
  cta: { label: string; href: string };
};

export const footerContent: FooterContent = {
  eyebrow: "Let's talk",
  tagline: { before: "Let's make your brand the ", highlight: "buzz", after: "." },
  email: "info@techbuzz.com.pk",
  phones: [
    { label: "Pakistan", display: "+92 326 100 5855", href: "tel:+923261005855" },
    // The live site lists +1 226 753 6059. Confirm which Canada line is current before launch.
    { label: "Canada", display: "+1 613 518 9745", href: "tel:+16135189745" },
  ],
  whatsapp: { label: "Chat on WhatsApp", href: "https://wa.me/923261005855" },
  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  studio: {
    label: "Studio",
    lines: ["187 A1 PIA Housing Society", "Johar Town, Lahore"],
    mapHref: "https://maps.app.goo.gl/ipbkNTWWhhBq1RnZA",
    timeZone: "Asia/Karachi",
    zoneLabel: "GMT+5",
  },
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/techbuzz.com.pk/", icon: "instagram", rgb: "225 48 108" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/techbuzzpkofficial/", icon: "linkedin", rgb: "10 102 194" },
    { label: "Facebook", href: "https://www.facebook.com/techbuzz.com.pk", icon: "facebook", rgb: "24 119 242" },
    { label: "TikTok", href: "https://www.tiktok.com/@techbuzzofficial", icon: "tiktok", rgb: "37 244 238" },
    { label: "Pinterest", href: "https://www.pinterest.com/techbuzzpk/", icon: "pinterest", rgb: "230 0 35" },
    { label: "X", href: "https://twitter.com/techbuzzpk", icon: "x", rgb: "255 255 255" },
  ],
  copyright: { since: 2019, name: "TechBuzz", suffix: "All rights reserved." },
  wordmark: "techbuzz",
  cta: { label: "Get in touch", href: "/contact" },
};
