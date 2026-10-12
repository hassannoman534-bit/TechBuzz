"use client";

/* ─── ClientsMarquee ─────────────────────────────────────────────────────────
   Two independent horizontal tracks of client name pills running at slightly
   different speeds (28s / 32s) so they feel naturally offset and organic.
   Each track is duplicated to create a seamless infinite loop.
   The whole strip pauses on hover; individual pills reveal colour on hover.
──────────────────────────────────────────────────────────────────────────── */

const CLIENTS = [
  "Ditto",
  "Secure Glaze",
  "The Texture Beauty",
  "Signia Glam",
  "Quality Windows",
  "Sultan Yakhni Pulao",
  "Sahil Bloom",
  "Utility",
];

/* Separator between pills */
function Dot() {
  return (
    <span
      aria-hidden
      style={{
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        flexShrink: 0,
        display: "inline-block",
        alignSelf: "center",
      }}
    />
  );
}

interface PillProps {
  name: string;
}

function Pill({ name }: PillProps) {
  return (
    <span
      className="client-pill"
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        padding:        "0.375rem 1rem",
        borderRadius:   "9999px",
        border:         "1px solid rgba(255,255,255,0.08)",
        background:     "rgba(255,255,255,0.03)",
        fontSize:       "0.8125rem",
        fontWeight:     500,
        color:          "#e2e8f0",
        whiteSpace:     "nowrap",
        opacity:        0.4,
        filter:         "grayscale(1)",
        transition:     "opacity 0.3s ease, filter 0.3s ease, border-color 0.3s ease",
        cursor:         "default",
        flexShrink:     0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.opacity      = "1";
        el.style.filter       = "grayscale(0)";
        el.style.borderColor  = "rgba(56,189,248,0.35)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.opacity      = "0.4";
        el.style.filter       = "grayscale(1)";
        el.style.borderColor  = "rgba(255,255,255,0.08)";
      }}
    >
      {name}
    </span>
  );
}

interface TrackProps {
  duration: number;
  reverse?: boolean;
}

function Track({ duration, reverse = false }: TrackProps) {
  /* Duplicate the list — the animation shifts by -50% so the seam is invisible */
  const items = [...CLIENTS, ...CLIENTS];

  return (
    <div
      className="marquee-outer"
      style={{ overflow: "hidden", width: "100%" }}
    >
      <div
        className="marquee-track-inner"
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "12px",
          width:          "max-content",
          animation:      `marquee-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          willChange:     "transform",
        }}
      >
        {items.map((name, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <Pill name={name} />
            <Dot />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsMarquee() {
  return (
    <section
      aria-label="Our clients"
      style={{ paddingBlock: "5rem", paddingInline: "0", overflow: "hidden" }}
    >
      {/* Section label */}
      <p
        style={{
          textAlign:      "center",
          fontSize:       "0.6875rem",
          fontWeight:     700,
          letterSpacing:  "0.12em",
          textTransform:  "uppercase",
          color:          "#484f58",
          marginBottom:   "2rem",
        }}
      >
        Trusted by brands across Pakistan &amp; beyond
      </p>

      {/* Marquee wrapper — pause on hover, edge fades via CSS mask */}
      <div
        className="marquee-wrapper"
        style={{
          position:   "relative",
          maskImage:  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
        onMouseEnter={(e) => {
          const tracks = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(".marquee-track-inner");
          tracks.forEach((t) => (t.style.animationPlayState = "paused"));
        }}
        onMouseLeave={(e) => {
          const tracks = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(".marquee-track-inner");
          tracks.forEach((t) => (t.style.animationPlayState = "running"));
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Track duration={28} />
          <Track duration={32} reverse />
        </div>
      </div>

      {/* Keyframe definition */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
