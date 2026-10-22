"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { ClientTile } from "./client-tile";
import { BlendCursor, type BlendCursorState } from "./blend-cursor";
import { clientWall, type ClientWallContent } from "./client-wall.config";

type ClientWallProps = { content?: ClientWallContent; className?: string };

const EASE = [0.22, 1, 0.36, 1] as const;
/** Scroll progress is smoothed so the 3D assembly glides instead of following every wheel tick */
const SCROLL_SPRING = { stiffness: 70, damping: 22, mass: 0.6 };
const CURSOR_SPRING = { stiffness: 520, damping: 42, mass: 0.35 };
/** One tile flips to the next client this often (only when there are more clients than tiles) */
const SWAP_EVERY_MS = 2600;
const COLS = 4;

/** 0 at the centre of the wall, 1 at the corners (on the 4 column desktop layout) */
function tileDistance(i: number, count: number): number {
  const rows = Math.ceil(count / COLS);
  const cx = (COLS - 1) / 2;
  const cy = (rows - 1) / 2;
  const dx = (i % COLS - cx) / cx;
  const dy = cy > 0 ? (Math.floor(i / COLS) - cy) / cy : 0;
  return Math.min(1, Math.hypot(dx, dy) / Math.SQRT2);
}

/**
 * "Brands that trust us": client logos on a wall of glass tiles.
 * - Scroll in: the wall is tilted back in 3D and each tile flies in from depth, centre first,
 *   settling flat as the section reaches the middle of the screen. Scroll out: tiles tilt away
 *   and sink back. Scrubbed by scroll with spring smoothing; transform and opacity only.
 * - Living wall: with more clients than tiles, one tile at a time rolls over to the next logo.
 * - Hover (desktop): a difference blend cursor inverts the hovered logo, the tile tilts toward
 *   the pointer and lifts, and the other logos fade back.
 */
export function ClientWall({ content = clientWall, className }: ClientWallProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const hoverMode = fine && !reduce;
  const animated = !reduce;

  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: 0.25 });

  // ---- scroll driven 3D
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, SCROLL_SPRING);
  const wallRotate = useTransform(progress, [0, 0.42, 0.7, 1], [24, 0, 0, -14]);
  const wallScale = useTransform(progress, [0, 0.42, 0.7, 1], [0.9, 1, 1, 0.94]);

  // ---- which client each tile shows
  const tileCount = Math.min(content.tiles, content.clients.length);
  const [shown, setShown] = useState<number[]>(() => Array.from({ length: tileCount }, (_, i) => i));
  const queue = useRef<number[]>([]);
  const lastSlot = useRef(-1);
  useEffect(() => {
    setShown(Array.from({ length: tileCount }, (_, i) => i));
    queue.current = content.clients.map((_, i) => i).slice(tileCount);
  }, [content.clients, tileCount]);

  // ---- hover
  const [hovered, setHovered] = useState<number | null>(null);
  const [cursor, setCursor] = useState<BlendCursorState>("off");
  const onHover = useCallback((slot: number | null) => {
    setHovered(slot);
    setCursor(slot === null ? "dot" : "tile");
  }, []);

  useEffect(() => {
    if (!animated || !inView || hovered !== null || queue.current.length === 0) return;
    const id = window.setInterval(() => {
      setShown((prev) => {
        let slot = Math.floor(Math.random() * prev.length);
        if (slot === lastSlot.current) slot = (slot + 1) % prev.length;
        lastSlot.current = slot;
        const incoming = queue.current.shift();
        if (incoming === undefined) return prev;
        queue.current.push(prev[slot]);
        const next = [...prev];
        next[slot] = incoming;
        return next;
      });
    }, SWAP_EVERY_MS);
    return () => window.clearInterval(id);
  }, [animated, inView, hovered]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cx = useSpring(x, CURSOR_SPRING);
  const cy = useSpring(y, CURSOR_SPRING);
  const onWallEnter = (e: PointerEvent<HTMLDivElement>): void => {
    if (!hoverMode) return;
    [x, cx].forEach((m) => m.jump(e.clientX));
    [y, cy].forEach((m) => m.jump(e.clientY));
    setCursor("dot");
  };
  const onWallMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!hoverMode) return;
    x.set(e.clientX);
    y.set(e.clientY);
  };
  const onWallLeave = (): void => {
    setCursor("off");
    setHovered(null);
  };

  const distances = useMemo(() => Array.from({ length: tileCount }, (_, i) => tileDistance(i, tileCount)), [tileCount]);
  const hoveredClient = hovered !== null ? content.clients[shown[hovered]] : undefined;

  return (
    <section
      ref={section}
      id="clients"
      aria-labelledby="client-wall-heading"
      className={cn("relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(5rem,13vh,9rem)] text-white", className)}
    >
      <div className="mb-[clamp(2.5rem,7vh,4.5rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:px-[clamp(1rem,4vw,4rem)]">
        <div>
          <motion.p
            className="mb-5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
          >
            {content.eyebrow}
          </motion.p>
          {/* the in-view trigger sits on the h2: a fully masked span never counts as "in view" */}
          <motion.h2
            id="client-wall-heading"
            className="font-footer-display text-[clamp(2.25rem,4.6vw,4.5rem)] font-medium leading-[1.04] tracking-[-0.04em]"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          >
            {content.lines.map((line, l) => (
              <span key={line} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="inline-block"
                  variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.2, ease: EASE, delay: l * 0.12 } } }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h2>
        </div>
        <motion.p
          className="max-w-[34ch] text-[clamp(0.98rem,1.1vw,1.15rem)] leading-relaxed text-white/55"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
        >
          {content.sub}
        </motion.p>
      </div>

      {/* perspective stage */}
      <div
        onPointerEnter={onWallEnter}
        onPointerMove={onWallMove}
        onPointerLeave={onWallLeave}
        className={cn("[perspective:1400px] md:px-[clamp(1rem,4vw,4rem)]", hoverMode && "md:cursor-none")}
      >
        <motion.ul
          aria-label="Clients"
          style={animated ? { rotateX: wallRotate, scale: wallScale, transformOrigin: "50% 100%" } : undefined}
          className="grid grid-cols-2 gap-[clamp(0.6rem,1vw,1rem)] [transform-style:preserve-3d] md:grid-cols-4"
        >
          {shown.map((clientIndex, slot) => (
            <ClientTile
              key={slot}
              slot={slot}
              client={content.clients[clientIndex]}
              progress={progress}
              distance={distances[slot] ?? 0}
              animated={animated}
              hoverMode={hoverMode}
              dimmed={hovered !== null && hovered !== slot}
              onHover={onHover}
            />
          ))}
        </motion.ul>
      </div>

      {hoverMode && <BlendCursor x={cx} y={cy} state={cursor} arrow={Boolean(hoveredClient?.href)} />}
    </section>
  );
}
