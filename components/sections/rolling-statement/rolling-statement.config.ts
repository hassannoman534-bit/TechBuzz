/**
 * Home statement that rolls on a 3D cylinder as you scroll (between the tunnel hero and Signature).
 * One string per line. Keep lines short (2 to 3 words) so they never wrap on phones.
 */
export type RollingStatementContent = {
  /** Read by screen readers as one sentence */
  sentence: string;
  lines: string[];
};

export const rollingStatementContent: RollingStatementContent = {
  sentence:
    "TechBuzz builds brands, platforms and campaigns for companies that would rather be talked about than scrolled past.",
  lines: [
    "TechBuzz builds",
    "brands, platforms",
    "and campaigns",
    "for companies",
    "that would rather",
    "be talked about",
    "than scrolled",
    "past.",
  ],
};
