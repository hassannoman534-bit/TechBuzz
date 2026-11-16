import { beliefLetter, PAPER } from "./belief-letter.config";

/**
 * The letter as real HTML.
 *
 * Rendered for reduced motion, for widths below the live threshold, and if a
 * WebGL context is lost. This is the accessible path and the only one a crawler
 * can read, so the copy is marked up properly rather than drawn, and it is
 * styled to match the painted sheet closely enough that a reader switching
 * between a phone and a desktop sees the same letter.
 *
 * Fonts come straight from the CSS variables. Only the painted sheet needs them
 * resolved to real family names, because only a 2D context cannot parse a
 * custom property.
 */
export function StaticLetter(): React.ReactElement {
  return (
    <article
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[2px] text-left"
      style={{
        background: `linear-gradient(150deg, ${PAPER.stockLight} 0%, ${PAPER.stockMid} 52%, ${PAPER.stockShade} 100%)`,
        boxShadow: "0 24px 60px -18px rgba(0,0,0,0.75), 0 2px 0 rgba(255,255,255,0.12) inset",
        padding: "clamp(1.1rem, 4.4%, 2.1rem)",
      }}
    >
      {/* The vertical word down the right margin, as on the painted sheet. */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none"
        style={{
          right: "clamp(0.1rem, 1.4%, 0.5rem)",
          top: "clamp(1.1rem, 5%, 2.4rem)",
          color: PAPER.goldPale,
          opacity: 0.5,
          fontFamily: "var(--font-syne), sans-serif",
          fontWeight: 600,
          fontSize: "clamp(1.5rem, 9.5%, 2.9rem)",
          letterSpacing: "0.1em",
          lineHeight: 1,
          writingMode: "vertical-rl",
          textOrientation: "upright",
        }}
      >
        {beliefLetter.verticalWord.toUpperCase()}
      </span>

      <div style={{ paddingRight: "14%" }}>
        <span
          className="block"
          style={{
            color: PAPER.ink,
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 600,
            fontSize: "clamp(0.72rem, 2.6%, 0.95rem)",
            letterSpacing: "0.28em",
          }}
        >
          {beliefLetter.letterhead.toUpperCase()}
        </span>
        <span
          aria-hidden
          className="mt-2 block"
          style={{
            height: "2px",
            width: "clamp(4rem, 26%, 7rem)",
            background: `linear-gradient(90deg, ${PAPER.gold}, rgba(169,129,31,0.15))`,
          }}
        />

        <span
          className="mt-[8%] block"
          style={{
            color: PAPER.gold,
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.8rem, 2.5%, 1.05rem)",
          }}
        >
          {beliefLetter.label}
        </span>

        <div
          className="mt-[5%]"
          style={{
            color: PAPER.ink,
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontSize: "clamp(0.78rem, 2.85%, 1.12rem)",
            lineHeight: 1.66,
          }}
        >
          {beliefLetter.body
            .filter(Boolean)
            .map((para) => (
              <p key={para.slice(0, 24)} className="mt-[0.85em] first:mt-0">
                {para}
              </p>
            ))}
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4" style={{ paddingTop: "6%" }}>
        <div>
          <span
            aria-hidden
            className="block"
            style={{
              height: "1px",
              width: "clamp(5rem, 42%, 9rem)",
              background: "linear-gradient(90deg, rgba(169,129,31,0.55), rgba(169,129,31,0))",
            }}
          />
          <span
            className="mt-[0.5em] block"
            style={{
              color: PAPER.ink,
              fontFamily: "var(--font-caveat), cursive",
              fontWeight: 600,
              fontSize: "clamp(1.3rem, 5.6%, 2.1rem)",
              lineHeight: 1.1,
            }}
          >
            {beliefLetter.signature}
          </span>
          <span
            className="mt-[0.35em] block"
            style={{
              color: PAPER.inkFaint,
              fontFamily: "var(--font-inter-tight), sans-serif",
              fontSize: "clamp(0.58rem, 1.8%, 0.72rem)",
              letterSpacing: "0.2em",
            }}
          >
            {beliefLetter.place.toUpperCase()}
          </span>
        </div>

        {/* The seal, opposite the signature. */}
        <span
          aria-hidden
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: "clamp(2.2rem, 13%, 3.4rem)",
            aspectRatio: "1",
            border: `2px solid ${PAPER.gold}b8`,
            boxShadow: `inset 0 0 0 1px ${PAPER.gold}55`,
            color: PAPER.gold,
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 600,
            fontSize: "clamp(0.72rem, 4.4%, 1.1rem)",
            letterSpacing: "0.04em",
          }}
        >
          {beliefLetter.monogram}
        </span>
      </div>
    </article>
  );
}
