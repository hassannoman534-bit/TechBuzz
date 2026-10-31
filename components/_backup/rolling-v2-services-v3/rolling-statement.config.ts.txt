/**
 * Home statement that rolls over a drum as you scroll (between the tunnel hero and Signature).
 * One string per line. Wrap words in *stars* to set them in italic.
 * Keep lines short (2 to 3 words) so they never wrap on phones.
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
    "*brands*, *platforms*",
    "and *campaigns*",
    "for companies",
    "that would rather",
    "be *talked about*",
    "than scrolled",
    "past.",
  ],
};
