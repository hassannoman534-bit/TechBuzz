"use client";

import { useId } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ProofStat } from "./impact-reveal.config";

type ProofChipProps = {
  stat: ProofStat;
  progress: MotionValue<number>;
  /** Scroll window in which this chip's number counts up and its visual draws */
  range: [number, number];
  className?: string;
};

/** Soft, edge-less proof card that floats around the word. Number and mini-visual animate with scroll. */
export function ProofChip({ stat, progress, range, className }: ProofChipProps) {
  const gid = useId().replace(/:/g, "");
  const t = useTransform(progress, range, [0, 1], { clamp: true });
  const number = useTransform(t, (v) => {
    const eased = 1 - (1 - v) ** 3;
    const n = stat.value * eased;
    return `${stat.prefix ?? ""}${n.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ""}`;
  });

  return (
    <div
      className={cn(
        "relative w-[clamp(13rem,19vw,17.5rem)] overflow-hidden rounded-[28px] p-[clamp(1rem,1.4vw,1.4rem)]",
        "bg-[linear-gradient(150deg,rgb(255_255_255/0.86),rgb(255_255_255/0.5))]",
        "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.95),0_24px_60px_-24px_rgb(70_50_160/0.45),0_2px_6px_rgb(70_50_160/0.06)]",
        className,
      )}
    >
      {/* Soft colour wash — no hard edges anywhere */}
      <div aria-hidden className="pointer-events-none absolute -left-1/4 -top-1/3 h-[120%] w-[80%] bg-[radial-gradient(closest-side,rgb(180_166_255/0.45),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-1/3 -right-1/4 h-[110%] w-[75%] bg-[radial-gradient(closest-side,rgb(155_239_255/0.4),transparent)]" />

      <div className="relative">
        <p className="font-signature text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[#5a5f7a]">{stat.label}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <motion.span className="bg-[linear-gradient(100deg,#4b2fe0,#7b61ff_45%,#0e9bb8)] bg-clip-text font-signature text-[clamp(1.75rem,2.6vw,2.6rem)] font-extrabold leading-none tracking-[-0.03em] text-transparent tabular-nums">
            {number}
          </motion.span>
          <Visual kind={stat.visual} t={t} gid={gid} rating={stat.value} />
        </div>
        <p className="mt-2 font-signature text-[0.8rem] text-[#5a5f7a]">{stat.caption}</p>
      </div>
    </div>
  );
}

type VisualProps = { kind: ProofStat["visual"]; t: MotionValue<number>; gid: string; rating: number };

function Visual({ kind, t, gid, rating }: VisualProps) {
  const grad = (
    <defs>
      <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#7b61ff" />
        <stop offset="1" stopColor="#0e9bb8" />
      </linearGradient>
    </defs>
  );

  if (kind === "bars") return <Bars t={t} gid={gid} grad={grad} />;
  if (kind === "line") return <Line t={t} gid={gid} grad={grad} />;
  if (kind === "stars") return <Stars t={t} gid={gid} grad={grad} rating={rating} />;
  return <Ring t={t} gid={gid} grad={grad} />;
}

type PartProps = { t: MotionValue<number>; gid: string; grad: React.ReactNode };

const BAR_HEIGHTS = [0.32, 0.48, 0.42, 0.7, 1];
function Bars({ t, gid, grad }: PartProps) {
  return (
    <svg viewBox="0 0 64 36" className="h-9 w-16 shrink-0" aria-hidden>
      {grad}
      {BAR_HEIGHTS.map((h, i) => (
        <Bar key={i} t={t} index={i} h={h} gid={gid} />
      ))}
    </svg>
  );
}
function Bar({ t, index, h, gid }: { t: MotionValue<number>; index: number; h: number; gid: string }) {
  const s = useTransform(t, [index * 0.12, index * 0.12 + 0.45], [0, 1], { clamp: true });
  return (
    <motion.rect
      x={index * 13 + 2}
      y={36 - 34 * h}
      width="8"
      height={34 * h}
      rx="3"
      fill={`url(#${gid})`}
      style={{ scaleY: s, originY: 1, transformBox: "fill-box" }}
    />
  );
}

function Line({ t, gid, grad }: PartProps) {
  const len = useTransform(t, [0, 0.85], [0, 1], { clamp: true });
  return (
    <svg viewBox="0 0 64 36" className="h-9 w-16 shrink-0 overflow-visible" aria-hidden>
      {grad}
      <motion.path
        d="M2 32 C 14 30, 18 26, 26 24 S 40 18, 46 12 S 58 5, 62 3"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="3"
        strokeLinecap="round"
        style={{ pathLength: len }}
      />
    </svg>
  );
}

function Ring({ t, gid, grad }: PartProps) {
  const len = useTransform(t, [0, 0.9], [0, 0.92], { clamp: true });
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 -rotate-90" aria-hidden>
      {grad}
      <circle cx="18" cy="18" r="14" fill="none" stroke="rgb(123 97 255 / 0.15)" strokeWidth="4" />
      <motion.circle cx="18" cy="18" r="14" fill="none" stroke={`url(#${gid})`} strokeWidth="4" strokeLinecap="round" style={{ pathLength: len }} />
    </svg>
  );
}

const STAR = "M7 0.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L7 10.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z";
function Stars({ t, gid, grad, rating }: PartProps & { rating: number }) {
  const width = useTransform(t, [0, 0.9], [0, (rating / 5) * 76], { clamp: true });
  return (
    <svg viewBox="0 0 76 14" className="h-4 w-[76px] shrink-0" aria-hidden>
      {grad}
      <clipPath id={`${gid}-c`}>
        <motion.rect x="0" y="0" height="14" width={width} />
      </clipPath>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={`b${i}`} d={STAR} transform={`translate(${i * 15.5} 0)`} fill="rgb(123 97 255 / 0.15)" />
      ))}
      <g clipPath={`url(#${gid}-c)`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`f${i}`} d={STAR} transform={`translate(${i * 15.5} 0)`} fill={`url(#${gid})`} />
        ))}
      </g>
    </svg>
  );
}
