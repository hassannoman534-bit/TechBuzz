"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { RollText } from "./roll-text";
import { StudioMap } from "./studio-map";
import type { ContactContent, Studio } from "./contact.config";

const EASE = [0.22, 1, 0.36, 1] as const;
const T = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
const SPRING = { stiffness: 160, damping: 20, mass: 0.6 };
const TILT = 7; // degrees

/**
 * Three studio cards. Each rises in with a clip reveal; its map draws itself and the pin drops.
 * Hover (mouse): the card tilts toward the cursor, a spotlight follows it, the map pans and zooms,
 * the city name rolls, the rim lights and the Maps button fills. Siblings dim.
 * No backdrop blur (the cards are 3D transformed). Motion values only.
 */
export function Studios({ content }: { content: ContactContent["studios"] }) {
  return (
    <section aria-labelledby="studios-h" className="px-[clamp(1.25rem,5vw,6rem)] pb-[clamp(4rem,10svh,7rem)] pt-[clamp(1rem,3svh,2rem)]">
      <h2 id="studios-h" className="text-white">
        <span className="font-footer-display text-[clamp(1.6rem,2.4vw,2.25rem)] font-medium tracking-[-0.03em]">{content.heading}</span>
      </h2>
      <ul className="group/list mt-[clamp(1.25rem,3svh,2rem)] grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {content.items.map((s, i) => (
          <StudioCard key={s.city} studio={s} index={i} />
        ))}
      </ul>
    </section>
  );
}

function StudioCard({ studio, index }: { studio: Studio; index: number }) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const on = fine && !reduce;
  const ref = useRef<HTMLAnchorElement>(null);

  // pointer position in the card, -0.5..0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-TILT, TILT]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [TILT, -TILT]);
  const panX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const panY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  // spotlight position in px (transform only), springs to the pointer
  const spotX = useSpring(useMotionValue(0), SPRING);
  const spotY = useSpring(useMotionValue(0), SPRING);

  const move = (e: PointerEvent<HTMLAnchorElement>): void => {
    if (!on || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
  };
  const leave = (): void => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 50, clipPath: "inset(26% -8% -8% -8% round 28px)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(-8% -8% -8% -8% round 28px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.3, ease: EASE, delay: index * 0.12 }}
      className={`transition-opacity ${T} md:group-hover/list:opacity-50 md:hover:!opacity-100`}
      style={{ perspective: "1100px" }}
    >
      <motion.a
        ref={ref}
        href={studio.mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onPointerMove={move}
        onPointerLeave={leave}
        style={on ? { rotateX, rotateY } : undefined}
        className={cn(
          "group/card relative isolate flex h-full flex-col overflow-hidden rounded-[28px] outline-none",
          "bg-[linear-gradient(180deg,rgb(255_255_255/0.05),rgb(255_255_255/0.015)_55%)] ring-1 ring-white/10",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_40px_90px_-50px_rgb(0_0_0/0.95)]",
          `transition-[box-shadow] ${T} hover:ring-white/20 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_50px_110px_-40px_rgb(123_97_255/0.45)]`,
          "focus-visible:ring-2 focus-visible:ring-[#7ce9ff]",
        )}
      >
        {/* map art */}
        <div className="relative h-[clamp(8.5rem,17svh,11rem)]">
          {/* the art dissolves into the card body (mask, no hard edge) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ maskImage: "linear-gradient(#000 35%, transparent)", WebkitMaskImage: "linear-gradient(#000 35%, transparent)" }}
          >
            <StudioMap variant={index} panX={panX} panY={panY} />
          </div>
          {studio.primary && (
            <span className="absolute left-5 top-5 whitespace-nowrap rounded-full bg-[#030712]/60 px-3 py-1.5 text-[0.8rem] text-[#7ce9ff] ring-1 ring-[#7ce9ff]/30">
              Head office
            </span>
          )}
        </div>

        {/* spotlight following the cursor */}
        {on && (
          <motion.span
            aria-hidden
            className={`pointer-events-none absolute left-0 top-0 -z-10 -ml-[13rem] -mt-[13rem] size-[26rem] rounded-full bg-[radial-gradient(circle,rgb(123_97_255/0.22),transparent_65%)] opacity-0 transition-opacity ${T} group-hover/card:opacity-100`}
            style={{ x: spotX, y: spotY }}
          />
        )}

        <div className="flex flex-1 flex-col gap-4 px-[clamp(1.25rem,2vw,1.75rem)] pb-[clamp(1.25rem,2vw,1.75rem)] pt-2">
          <RollText group="card" className="font-footer-display text-[clamp(2.2rem,3.6vw,3.6rem)] font-medium leading-[1.05] tracking-[-0.045em] text-white">
            {studio.city}
          </RollText>
          <p className={`text-[1rem] leading-[1.55] text-white/60 transition-colors ${T} group-hover/card:text-white/85`}>
            {studio.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </p>
          <span className="mt-auto inline-flex items-center gap-3 pt-2 text-[0.92rem] text-white/60">
            <span aria-hidden className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-white/15">
              <span
                className={`absolute inset-0 rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] transition-[clip-path] ${T} [clip-path:circle(0%_at_0%_100%)] group-hover/card:[clip-path:circle(140%_at_0%_100%)]`}
              />
              <ArrowUpRight strokeWidth={1.6} className={`relative size-4 transition-[transform,color] ${T} group-hover/card:rotate-45 group-hover/card:text-white`} />
            </span>
            <span className={`whitespace-nowrap transition-colors ${T} group-hover/card:text-white`}>Open in Maps</span>
          </span>
        </div>
      </motion.a>
    </motion.li>
  );
}
