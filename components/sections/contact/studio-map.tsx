"use client";

import { motion, type MotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

type StudioMapProps = {
  /** which street pattern to draw (0, 1, 2) */
  variant: number;
  /** pointer offset for the slow pan, in px */
  panX: MotionValue<number>;
  panY: MotionValue<number>;
};

/* Abstract street patterns, not real maps: a main artery, cross streets and a soft curve */
const ROUTES: string[][] = [
  ["M-10 150 C 80 120, 160 160, 250 110 S 380 70, 420 90", "M60 -10 L 110 230", "M200 -10 C 190 80, 230 140, 210 230", "M-10 60 L 420 40", "M300 -10 L 340 230", "M-10 200 C 120 190, 260 210, 420 180"],
  ["M-10 100 L 420 130", "M90 -10 C 120 80, 70 150, 100 230", "M250 -10 L 230 230", "M-10 30 C 140 60, 260 10, 420 50", "M330 -10 C 300 90, 360 150, 340 230", "M-10 190 L 420 175"],
  ["M-10 120 C 100 140, 300 90, 420 120", "M140 -10 L 160 230", "M280 -10 C 260 70, 300 160, 270 230", "M-10 50 L 420 70", "M40 -10 L 20 230", "M-10 205 C 150 180, 250 215, 420 195"],
];
const PIN: [number, number][] = [
  [205, 118],
  [240, 122],
  [155, 108],
];

/**
 * Decorative map: streets draw themselves when the card scrolls in, the pin drops and pulses.
 * The art pans a little with the cursor (transform only, from the card's motion values).
 */
export function StudioMap({ variant, panX, panY }: StudioMapProps) {
  const reduce = useReducedMotionSafe();
  const routes = ROUTES[variant % ROUTES.length];
  const [px, py] = PIN[variant % PIN.length];

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-[-8%] h-[116%] w-[116%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]"
      style={{ x: panX, y: panY }}
    >
      <defs>
        <radialGradient id={`studio-fade-${variant}`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`studio-mask-${variant}`}>
          <rect width="400" height="220" fill={`url(#studio-fade-${variant})`} />
        </mask>
      </defs>
      <g mask={`url(#studio-mask-${variant})`}>
        {/* fine grid */}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="220" stroke="rgb(255 255 255 / 0.04)" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 44} x2="400" y2={i * 44} stroke="rgb(255 255 255 / 0.04)" />
        ))}
        {routes.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={i === 0 ? "rgb(123 97 255 / 0.55)" : "rgb(255 255 255 / 0.16)"}
            strokeWidth={i === 0 ? 2 : 1}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
          />
        ))}
      </g>
      {/* pin */}
      <motion.g
        initial={reduce ? false : { opacity: 0, y: -14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 1.1 }}
      >
        <circle cx={px} cy={py} r="16" fill="rgb(34 216 255 / 0.18)" className="origin-center animate-[studio-pulse_2.8s_ease-out_infinite] motion-reduce:animate-none" style={{ transformBox: "fill-box" }} />
        <circle cx={px} cy={py} r="5" fill="#22d8ff" />
        <circle cx={px} cy={py} r="2" fill="#fff" />
      </motion.g>
      <style>{`@keyframes studio-pulse{0%{transform:scale(.4);opacity:.9}100%{transform:scale(2.2);opacity:0}}`}</style>
    </motion.svg>
  );
}
