import { useId, type ReactNode } from "react";
import type { ServiceArt as ArtKind } from "./services.config";

/**
 * Geometric artwork for each expanded card — static SVG (cheap to composite),
 * layered translucent shapes in the brand palette, fading out toward the text side.
 */
export function ServiceArt({ kind }: { kind: ArtKind }) {
  const id = useId().replace(/:/g, "");
  const g = (n: string) => `${id}-${n}`;

  const defs = (
    <defs>
      <linearGradient id={g("v")} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#7b61ff" stopOpacity="0.95" />
        <stop offset="0.55" stopColor="#5b7cff" stopOpacity="0.7" />
        <stop offset="1" stopColor="#22d8ff" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id={g("d")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9befff" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="#7b61ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#2b1a7a" stopOpacity="0.2" />
      </linearGradient>
      <radialGradient id={g("r")} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#22d8ff" stopOpacity="0.55" />
        <stop offset="0.6" stopColor="#7b61ff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#7b61ff" stopOpacity="0" />
      </radialGradient>
      {/* Fade the art out toward the left so it never competes with the copy */}
      <linearGradient id={g("fade")} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.68" stopColor="#fff" stopOpacity="0.7" />
        <stop offset="0.9" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id={g("m")}>
        <rect width="600" height="400" fill={`url(#${g("fade")})`} />
      </mask>
    </defs>
  );

  const shapes: Record<ArtKind, ReactNode> = {
    bars: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={250 + i * 44} y={400 - (90 + i * 38)} width="40" height={90 + i * 38} rx="6" fill={`url(#${g("v")})`} opacity={0.35 + i * 0.08} />
    )),
    rings: [200, 160, 120, 82, 46].map((r, i) => (
      <circle key={r} cx="470" cy="300" r={r} fill={`url(#${g("d")})`} opacity={0.22 + i * 0.12} />
    )),
    orbits: (
      <>
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx="440" cy="210" rx={210 - i * 40} ry={90 - i * 14} fill="none" stroke={`url(#${g("d")})`} strokeWidth="2" transform={`rotate(${-18 + i * 24} 440 210)`} opacity={0.7} />
        ))}
        <circle cx="440" cy="210" r="70" fill={`url(#${g("r")})`} />
        {[[260, 160], [610, 250], [430, 110], [520, 320]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="14" fill="#9befff" opacity="0.55" />
        ))}
      </>
    ),
    frames: (
      <>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={330 + i * 30} y={70 + i * 30} width={290 - i * 60} height={260 - i * 60} rx={34 - i * 4} fill={`url(#${g("d")})`} opacity={0.25 + i * 0.14} />
        ))}
        <path d="M468 178 L510 200 L468 222 Z" fill="#e7eaf3" opacity="0.85" />
      </>
    ),
    peaks: [0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${470 - (220 - i * 48)} 420 L470 ${60 + i * 62} L${470 + (220 - i * 48)} 420 Z`} fill={`url(#${g("d")})`} opacity={0.25 + i * 0.16} />
    )),
    windows: (
      <>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${290 + i * 70} ${60 + i * 60})`} opacity={0.35 + i * 0.22}>
            <rect width="250" height="190" rx="18" fill={`url(#${g("d")})`} />
            <rect x="16" y="16" width="60" height="8" rx="4" fill="#e7eaf3" opacity="0.6" />
            <rect x="16" y="40" width="218" height="74" rx="10" fill="#e7eaf3" opacity="0.12" />
          </g>
        ))}
      </>
    ),
    network: (
      <>
        {[
          [300, 120, 420, 210], [420, 210, 560, 120], [420, 210, 520, 320], [300, 120, 360, 300], [360, 300, 520, 320], [560, 120, 600, 250],
        ].map(([a, b, c, d]) => (
          <line key={`${a}${b}${c}${d}`} x1={a} y1={b} x2={c} y2={d} stroke={`url(#${g("d")})`} strokeWidth="2.5" opacity="0.75" />
        ))}
        <circle cx="420" cy="210" r="90" fill={`url(#${g("r")})`} />
        {[[300, 120, 12], [420, 210, 22], [560, 120, 14], [520, 320, 16], [360, 300, 11], [600, 250, 10]].map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#9befff" opacity="0.8" />
        ))}
      </>
    ),
  };

  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMaxYMid slice" className="h-full w-full" aria-hidden>
      {defs}
      <g mask={`url(#${g("m")})`}>{shapes[kind]}</g>
    </svg>
  );
}
