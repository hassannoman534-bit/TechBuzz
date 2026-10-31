"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ServiceArt } from "./service-art";
import type { ShowcaseCardData } from "./services-showcase.config";

type ServiceCardProps = { card: ShowcaseCardData; href: string; priority?: boolean };

const TILT = 7; // deg
const PAN = 12; // px the picture drifts against the cursor
const SPRING = { stiffness: 180, damping: 22, mass: 0.6 };

/**
 * One service: portrait picture plus caption. On desktop hover the picture tilts toward the cursor,
 * zooms and drifts the other way (parallax), a light follows the pointer, an accent rim lights up and a
 * glass "View pricing" chip rises. Pointer work runs on motion values only, no React state per move.
 */
export function ServiceCard({ card, href, priority = false }: ServiceCardProps) {
  const fine = useFinePointer();
  const reduce = useReducedMotionSafe();
  const live = fine && !reduce;

  const frameRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5); // 0..1 across the frame
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [0, 1], [-TILT, TILT]);
  const rotateX = useTransform(sy, [0, 1], [TILT, -TILT]);
  const panX = useTransform(sx, [0, 1], [PAN, -PAN]);
  const panY = useTransform(sy, [0, 1], [PAN, -PAN]);
  const lightX = useTransform(px, (v) => `${v * 100}%`);
  const lightY = useTransform(py, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(60% 50% at ${lightX} ${lightY}, rgb(255 255 255 / 0.16), transparent 70%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = (): void => {
    px.set(0.5);
    py.set(0.5);
  };

  const [a, b] = card.accent;

  return (
    <Link
      href={href}
      data-svc
      className="group/card block rounded-[1.25rem] outline-none transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
      aria-label={`${card.title}: view pricing`}
    >
      {/* Picture */}
      <motion.div
        ref={frameRef}
        onPointerMove={live ? onMove : undefined}
        onPointerLeave={live ? onLeave : undefined}
        style={live ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
        className="relative aspect-[4/5] w-full"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[1.1rem] bg-[#080b18] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
          {/* image layer: zooms on hover (CSS) and drifts with the pointer (motion values) */}
          <motion.div style={live ? { x: panX, y: panY } : undefined} className="absolute -inset-4">
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.08]">
              {card.image ? (
                <Image
                  src={card.image}
                  alt=""
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 22vw, 46vw"
                  className="object-cover"
                />
              ) : (
                <ServiceArt id={card.id} index={card.index} accent={card.accent} />
              )}
            </div>
          </motion.div>

          {/* bottom shade so the chip reads on any picture */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

          {/* cursor light */}
          {live && (
            <motion.div
              aria-hidden
              style={{ backgroundImage: light }}
              className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/card:opacity-100"
            />
          )}

          {/* View pricing chip */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between gap-2 rounded-full bg-black/45 py-1.5 pl-3.5 pr-1.5 opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_0_0_1px_rgb(255_255_255/0.1)] transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:opacity-100">
            <span className="truncate font-footer-text text-[0.72rem] font-medium text-white/90">
              View pricing
            </span>
            <span className="grid size-7 shrink-0 place-items-center rounded-full text-white" style={{ background: `linear-gradient(140deg, ${a}, ${b})` }}>
              <ArrowUpRightIcon className="size-3.5" strokeWidth={2} />
            </span>
          </div>
        </div>

        {/* accent rim + glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.1rem] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            padding: 1,
            background: `linear-gradient(140deg, ${a}, transparent 45%, ${b})`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[8%] -bottom-[10%] top-[60%] -z-10 rounded-full opacity-0 transition-opacity duration-700 group-hover/card:opacity-60"
          style={{ background: `radial-gradient(50% 50% at 50% 50%, ${a}66, transparent 70%)` }}
        />
      </motion.div>

      {/* Caption */}
      <div className="mt-3 font-footer-text">
        <div className="flex items-baseline justify-between gap-3 text-[0.68rem] uppercase tracking-[0.2em] text-white/40">
          <span className="transition-colors duration-500 group-hover/card:text-[#7ce9ff]">{card.index}</span>
          <span className="hidden sm:inline">{card.fromPrice !== null ? `From $${card.fromPrice.toLocaleString("en-US")}` : "Custom"}</span>
        </div>
        <h3 className="mt-2 flex items-start gap-1.5 font-footer-display text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium leading-[1.12] tracking-[-0.03em] text-white">
          <span>{card.title}</span>
          <ArrowUpRightIcon
            aria-hidden
            className="mt-[0.15em] size-[0.8em] shrink-0 -translate-x-1 translate-y-1 text-white/0 transition-[translate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-x-0 group-hover/card:translate-y-0 group-hover/card:text-white/70"
            strokeWidth={1.75}
          />
        </h3>
        <p className="mt-1 hidden text-[0.75rem] leading-snug text-white/50 line-clamp-2 lg:[display:-webkit-box]">{card.blurb}</p>
      </div>
    </Link>
  );
}
