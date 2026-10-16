"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, type MotionValue } from "framer-motion";

type RibbonProps = {
  /** Scene progress 0 → 1 (moves and reshapes the ribbon) */
  progress: MotionValue<number>;
  /** Spring-smoothed scroll velocity (px/s), adds a jelly wobble */
  velocity: MotionValue<number>;
  /** 0 → 1 on load: the ribbon flows in once */
  intro: MotionValue<number>;
};

/** Route of the ribbon in a 1440 × 900 box: in from the top left, down the left, under, up the right */
const BASE: [number, number][] = [
  [-120, 80], [140, 60], [290, 210], [230, 380], [130, 560], [300, 720],
  [620, 800], [900, 740], [1120, 620], [1300, 460], [1290, 260], [1400, 80], [1580, 40],
];
const V_MAX = 2600;

/** Catmull-Rom through the points → one smooth cubic Bézier path */
function toPath(pts: [number, number][]): string {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * A thick glossy tube that drifts like liquid: every point bobs on its own slow wave, the
 * whole shape eases upward and swells as you scroll, and fast scrolling makes it wobble.
 * Built from four strokes of one path (glow, body, shade, highlight). The path is rebuilt
 * once per frame only while the ribbon is on screen.
 */
export function Ribbon({ progress, velocity, intro }: RibbonProps) {
  const svg = useRef<SVGSVGElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const visible = useRef(true);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? true;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((t) => {
    if (!visible.current) return;
    const p = progress.get();
    const v = Math.max(-1, Math.min(1, velocity.get() / V_MAX));
    const drawn = Math.min(1, intro.get());

    const time = t / 1000;
    const amp = 16 + 34 * Math.abs(v) + 22 * Math.sin(Math.PI * Math.min(p * 1.4, 1));
    const lift = -150 * p; // the ribbon rises as the card grows
    const pts = BASE.map(([x, y], i): [number, number] => [
      x + Math.cos(time * 0.55 + i * 1.3) * amp * 0.45,
      y + lift * (0.4 + (i % 3) * 0.3) + Math.sin(time * 0.8 + i * 0.9) * amp + v * 40 * Math.sin(i * 1.7),
    ]);
    const d = toPath(pts);
    const offset = (1 - drawn).toFixed(4);
    paths.current.forEach((path) => {
      if (!path) return;
      path.setAttribute("d", d);
      path.style.strokeDashoffset = offset;
    });
  });

  const common = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, vectorEffect: "non-scaling-stroke" as const, pathLength: 1, strokeDasharray: "1 1" };

  return (
    <svg ref={svg} aria-hidden viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
      <defs>
        <linearGradient id="tb-ribbon-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7b61ff" />
          <stop offset="0.5" stopColor="#5b7cff" />
          <stop offset="1" stopColor="#22d8ff" />
        </linearGradient>
      </defs>
      {/* soft glow */}
      <path ref={(n) => { paths.current[0] = n; }} {...common} stroke="#6d6bff" strokeOpacity={0.12} className="[stroke-width:30px] md:[stroke-width:52px]" />
      {/* body */}
      <path ref={(n) => { paths.current[1] = n; }} {...common} stroke="url(#tb-ribbon-body)" className="[stroke-width:16px] md:[stroke-width:30px]" />
      {/* shade on the lower side, for a round tube */}
      <path ref={(n) => { paths.current[2] = n; }} {...common} stroke="#070826" strokeOpacity={0.35} className="[stroke-width:6px] md:[stroke-width:12px]" transform="translate(0 5)" />
      {/* specular highlight */}
      <path ref={(n) => { paths.current[3] = n; }} {...common} stroke="#ffffff" strokeOpacity={0.5} className="[stroke-width:3px] md:[stroke-width:5px]" transform="translate(0 -5)" />
    </svg>
  );
}
