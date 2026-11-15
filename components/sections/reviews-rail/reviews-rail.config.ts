/**
 * Reviews rail: the Google reviews shown above the footer on /services.
 *
 * SOURCING RULES. Read before editing this file.
 *
 * 1. `quote` is the reviewer's own text. It may be trimmed at a sentence end so
 *    it fits, and nothing else. Never reword it, never finish a sentence for
 *    them, never merge two reviewers. If a quote needs a dash or an exclamation
 *    mark because that is what they typed, it keeps it: the no dashes copy rule
 *    is for words we write, not for words we are quoting.
 * 2. `pull` is a sentence lifted verbatim out of `quote`, not a paraphrase.
 * 3. `author` and `avatar` stay undefined until a real name and a real face are
 *    confirmed. A testimonial under an invented name is a fake review. With no
 *    author the badge leads with `topic` and attributes to Google, which is
 *    true, and the layout upgrades on its own once names arrive.
 * 4. `topic` and `tags` are our own labels for what the review is about. They
 *    are editorial, so they must stay an accurate description of the quote.
 *
 * PROVENANCE. The four quotes below came from the Google Business Profile for
 * "TechBuzz - Digital Marketing Agency in Lahore, Pakistan", 187-A-1 PIA
 * Housing Society, Johar Town, read on 2026-11-15 through the Google Places
 * API, which exposes five reviews out of the 68 on the listing and returns no
 * author names. The fifth is left out on purpose: it is about what the office
 * is like to work in, not about the work, so it is a staff review and does not
 * belong in a client rail.
 *
 * The aggregate below is a snapshot of a number that moves. Re-read the listing
 * before a launch rather than letting it drift.
 */

export type ReviewTone = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  /** Reviewer's name as it appears on Google. Undefined until confirmed. */
  author?: string;
  /** Square portrait in /public. Undefined falls back to a drawn monogram. */
  avatar?: string;
  /** What the badge leads with while there is no author. Our label, not theirs. */
  topic: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Verbatim. Trimmed at a sentence end at most. */
  quote: string;
  /** A sentence lifted out of `quote`, for the badge back, which clamps to four lines. */
  pull: string;
  /** Our labels for the subject of the review. */
  tags?: string[];
  tone?: ReviewTone;
};

export type ReviewsSource = {
  label: string;
  rating: string;
  count: number;
  /** Documented Google Maps deep link format, built from the listing's place id. */
  url: string;
  /** When the numbers above were last read off the listing. */
  checked: string;
};

export const reviewsSource: ReviewsSource = {
  label: "Google",
  rating: "4.9",
  count: 68,
  url: "https://www.google.com/maps/place/?q=place_id:ChIJGWoyuRkFGTkRkuPWhsfrbEw",
  checked: "2026-11-15",
};

export const reviews: Review[] = [
  {
    id: "communication",
    topic: "Communication",
    rating: 5,
    tone: 1,
    quote:
      "I had a really good experience with TechBuzz. The team was very cooperative, friendly and professional throughout the process. They listened to my requirements properly and explained everything in an easy way. The communication was also good, and whenever I had any questions, they responded and guided me. Overall, I am satisfied with their service and the way they handled everything. Would definitely recommend TechBuzz to anyone looking for digital marketing services.",
    pull: "They listened to my requirements properly and explained everything in an easy way.",
    tags: ["Onboarding", "Support"],
  },
  {
    id: "strategy",
    topic: "Strategy",
    rating: 5,
    tone: 2,
    quote:
      "Working with TechBuzz has been an absolute game-changer for our business. Their team is incredibly professional, creative, and truly understands the digital landscape. They developed a tailored marketing strategy that significantly boosted our online presence, engagement, and ultimately, our sales. What stands out most is their dedication and transparency.",
    pull: "A tailored marketing strategy that significantly boosted our online presence, engagement, and ultimately, our sales.",
    tags: ["Paid ads", "Reporting"],
  },
  {
    id: "seo",
    topic: "SEO",
    rating: 5,
    tone: 3,
    quote:
      "TechBuzz has been a solid support for our digital marketing and SEO needs. The team is easy to work with, responsive, and focuses on practical strategies that actually improve visibility and traffic. We have seen steady improvements since working with them, especially in organic growth.",
    pull: "We have seen steady improvements since working with them, especially in organic growth.",
    tags: ["SEO", "Organic growth"],
  },
  {
    id: "delivery",
    topic: "Delivery",
    rating: 5,
    tone: 5,
    quote:
      "Excellent experience with TechBuzz! Their team is professional, responsive, and delivers great digital marketing results. Highly recommended.",
    pull: "Professional, responsive, and delivers great digital marketing results.",
    tags: ["Social media", "Delivery"],
  },
];

export const reviewsContent = {
  eyebrow: "Client reviews",
  heading: "Rated 4.9 on Google.",
  /** Shown under the rail while no badge is selected. */
  caption: "Brush along the rail, pull a badge down, click to flip it.",
  /** Prompt that replaces the review text before anything is chosen. */
  idle: "Pick a badge to read the review in full.",
  linkLabel: "Read every review on Google",
  labels: {
    flip: "Click or press Enter to read it",
    back: "Click again or press Esc to turn it back",
    show: "Show",
  },
} as const;

/** Site easing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Brand hex per tone slot, matching --color-chart-1..5 in globals.css. */
const TONE_HEX: Record<ReviewTone, string> = {
  1: "#7b61ff",
  2: "#5b7cff",
  3: "#2cf5b0",
  4: "#b4a6ff",
  5: "#22d8ff",
};

function disc(tone: ReviewTone, inner: string): string {
  const hex = TONE_HEX[tone];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${hex}" stop-opacity="0.92"/>` +
    `<stop offset="1" stop-color="#0c1222"/></linearGradient></defs>` +
    `<rect width="96" height="96" fill="url(#g)"/>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Two letters from a real name, for when the badge has one. */
function initialsOf(author: string): string {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

/**
 * What goes in the badge's photo slot.
 *
 * A data URL rather than a component, because the badge takes an image `src`:
 * the borrowed component stays untouched and every badge still gets a face
 * instead of the same grey silhouette four times over.
 *
 * With a name confirmed it draws that person's initials. Without one it draws a
 * star, not invented initials: four badges all reading the same two letters
 * looks like a placeholder nobody filled in, which is exactly what it would be.
 */
export function badgeFace(review: Review): string {
  if (review.avatar) return review.avatar;
  const tone = review.tone ?? 1;
  if (review.author) {
    return disc(
      tone,
      `<text x="48" y="48" fill="#ffffff" fill-opacity="0.92" font-family="system-ui,sans-serif"` +
        ` font-size="34" font-weight="700" letter-spacing="1" text-anchor="middle"` +
        ` dominant-baseline="central">${initialsOf(review.author)}</text>`,
    );
  }
  return disc(
    tone,
    `<path d="M48 26l6.6 14.1 14.8 2.1-10.7 10.8 2.5 15.3L48 61.1 34.8 68.3l2.5-15.3L26.6 42.2l14.8-2.1z"` +
      ` fill="#ffffff" fill-opacity="0.9"/>`,
  );
}
