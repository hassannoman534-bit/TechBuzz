"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { FolioLightbox } from "./folio-lightbox";
import { FolioTile } from "./folio-tile";
import type { FolioChapterData } from "./folio-library";

/*
 * Timeline, as a share of the chapter's pinned scroll (0 = stage pins, 1 = it releases):
 * the card floats in tilted, grows to full screen while it flattens and the title words slide apart,
 * then the cover dims and the film strip of the folio rises and drifts across.
 */
const ENTER: [number, number] = [0, 0.08];
const EXPAND: [number, number] = [0.04, 0.5];
const VEIL: [number, number] = [0.46, 0.6];
const STRIP_IN: [number, number] = [0.52, 0.64];
const STRIP_MOVE: [number, number] = [0.56, 1];
const LENGTH_VH = 320; // section height

/** Start card size: 300 x 400 on desktop, scaled down on small screens */
const CARD_W = 300;
const CARD_H = 400;
const RADIUS = 22;
const TILT = 14; // deg the card starts tilted back
const POINTER_PAN = 14; // px the cover drifts with the pointer
const SPRING = { stiffness: 120, damping: 20, mass: 0.6 };

type FolioChapterProps = {
  chapter: FolioChapterData;
  index: number;
  total: number;
};

export function FolioChapter({ chapter, index, total }: FolioChapterProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const size = useRef({ w: 1440, h: 900, strip: 0 });
  const [open, setOpen] = useState<number | null>(null);

  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const measure = (): void => {
      size.current = { w: window.innerWidth, h: window.innerHeight, strip: stripRef.current?.scrollWidth ?? 0 };
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stripRef.current) ro.observe(stripRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Card -> full screen */
  const grow = useTransform(p, EXPAND, [0, 1], { clamp: true });
  const eased = useTransform(grow, (t) => 1 - Math.pow(1 - t, 3));
  const clipPath = useTransform(eased, (t) => {
    const { w, h } = size.current;
    const k = Math.min(1, (w * 0.62) / CARD_W, (h * 0.52) / CARD_H);
    const insetX = Math.max(0, (w - CARD_W * k) / 2) * (1 - t);
    const insetY = Math.max(0, (h - CARD_H * k) / 2) * (1 - t);
    const r = RADIUS * (1 - t);
    return `inset(${insetY.toFixed(1)}px ${insetX.toFixed(1)}px round ${r.toFixed(1)}px)`;
  });
  const tilt = useTransform(eased, [0, 0.6], [TILT, 0], { clamp: true });
  const lift = useTransform(p, ENTER, ["6svh", "0svh"]);
  const coverScale = useTransform(p, [0, EXPAND[1], 1], [1.35, 1.05, 1]); // slow Ken Burns all the way
  const glow = useTransform(eased, [0, 0.7], [1, 0]);

  /* Backdrop: the same art, huge, dim, drifting the other way */
  const bgOpacity = useTransform(eased, [0, 1], [1, 0]);
  const bgScale = useTransform(p, [0, EXPAND[1]], [1.2, 1.45]);

  /* Title + captions */
  const apartL = useTransform(eased, (t) => `${-t * 42}vw`);
  const apartR = useTransform(eased, (t) => `${t * 42}vw`);
  const titleOpacity = useTransform(p, [EXPAND[1] - 0.08, EXPAND[1]], [1, 0]);

  /* Expanded state */
  const veil = useTransform(p, VEIL, [0, 1]);
  const stripOpacity = useTransform(p, STRIP_IN, [0, 1]);
  const stripY = useTransform(p, STRIP_IN, ["12svh", "0svh"]);
  const stripX = useTransform(p, (v) => {
    const { w, strip } = size.current;
    const t = Math.min(1, Math.max(0, (v - STRIP_MOVE[0]) / (STRIP_MOVE[1] - STRIP_MOVE[0])));
    const start = w * 0.35;
    const end = Math.min(-(strip - w * 0.75), 0);
    return start + (end - start) * t;
  });

  /* Pointer parallax on the cover (desktop) */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const panX = useSpring(px, SPRING);
  const panY = useSpring(py, SPRING);
  const bgPanX = useTransform(panX, (v) => -v * 0.6);
  const bgPanY = useTransform(panY, (v) => -v * 0.6);
  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    const { w, h } = size.current;
    px.set(((e.clientX / w) * 2 - 1) * POINTER_PAN);
    py.set(((e.clientY / h) * 2 - 1) * POINTER_PAN);
  };

  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const label = `${chapter.title[0]}${chapter.title[1].startsWith("folio") ? "" : " "}${chapter.title[1]}`;
  const live = fine && !reduce;

  if (reduce) return <StaticChapter chapter={chapter} number={number} label={label} />;

  return (
    <section ref={sectionRef} aria-label={label} className="relative" style={{ height: `${LENGTH_VH}vh` }}>
      <div
        className="sticky top-0 h-svh overflow-hidden bg-[#030712]"
        onPointerMove={live ? onMove : undefined}
        onPointerLeave={live ? () => (px.set(0), py.set(0)) : undefined}
      >
        {/* backdrop */}
        <motion.div aria-hidden style={{ opacity: bgOpacity }} className="absolute inset-0">
          <motion.div style={{ scale: bgScale, x: bgPanX, y: bgPanY }} className="absolute inset-0">
            <Image src={chapter.backdrop} alt="" fill sizes="100vw" className="object-cover opacity-50" />
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_50%,rgb(3_7_18/0.35),#030712_88%)]" />
        </motion.div>

        {/* the card: one full screen layer, clipped from a card to the whole screen, tilted back at first */}
        <motion.div style={{ y: lift, perspective: 1400 }} className="absolute inset-0">
          {/* soft glow behind the small card */}
          <motion.div
            aria-hidden
            style={{ opacity: glow }}
            className="absolute left-1/2 top-1/2 size-[min(60vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(123_97_255/0.35),rgb(34_216_255/0.12)_55%,transparent)]"
          />
          <motion.div style={{ clipPath, rotateX: tilt }} className="absolute inset-0 origin-center will-change-transform">
            <motion.div style={{ scale: coverScale, x: panX, y: panY }} className="absolute -inset-4">
              {chapter.cover.fit === "contain" ? (
                <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_40%,#1a1f3a,#05070f)]">
                  <div className="absolute inset-[30%]">
                    <Image src={chapter.cover.src} alt={label} fill sizes="40vw" className="object-contain" />
                  </div>
                </div>
              ) : (
                <Image src={chapter.cover.src} alt={label} fill sizes="100vw" priority={index === 0} className="object-cover" />
              )}
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_7_18/0.1),rgb(3_7_18/0.35))]" />
            <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_7_18/0.5),rgb(3_7_18/0.92))]" />
          </motion.div>
        </motion.div>

        {/* title words slide apart over the growing card */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[0.12em] font-footer-display text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white [text-shadow:0_8px_40px_rgb(3_7_18/0.55)]"
        >
          <motion.span style={{ x: apartL }} className="block whitespace-nowrap">
            {chapter.title[0]}
          </motion.span>
          <motion.span style={{ x: apartR }} className="block whitespace-nowrap">
            {chapter.title[1]}
          </motion.span>
        </motion.div>

        {/* captions under the card */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(2rem,9svh,5rem)] flex items-center justify-center gap-6 font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/60"
        >
          <motion.span style={{ x: apartL }}>{number}</motion.span>
          <motion.span style={{ x: apartR }}>{chapter.caption}</motion.span>
        </motion.div>

        {/* expanded: heading + film strip */}
        <motion.div style={{ opacity: stripOpacity, y: stripY }} className="absolute inset-0 flex flex-col justify-end pb-[clamp(2rem,7svh,4.5rem)]">
          <div className="mb-[clamp(1.25rem,4svh,2.5rem)] flex items-end justify-between gap-6 px-[clamp(1.25rem,6vw,8rem)] text-white">
            <div>
              <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/50">{number}</p>
              <p className="mt-2 font-footer-display text-[clamp(2rem,4.6vw,4.5rem)] font-semibold leading-none tracking-[-0.045em]">{label}</p>
            </div>
            <p className="shrink-0 font-footer-text text-[0.8rem] text-white/55">{chapter.count} pieces</p>
          </div>
          {chapter.images.length > 0 && (
            <motion.div
              ref={stripRef}
              style={{ x: stripX }}
              className={cn(
                "flex w-max gap-[clamp(0.9rem,1.6vw,1.5rem)] py-3 will-change-transform",
                // the hovered tile stays bright, the rest step back (desktop)
                "[@media(hover:hover)_and_(pointer:fine)]:[&:has([data-folio-tile]:hover)_[data-folio-tile]:not(:hover)]:opacity-50",
              )}
            >
              {chapter.images.map((image, i) => (
                <FolioTile key={image.src} image={image} index={i} onOpen={setOpen} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <FolioLightbox images={chapter.images} index={open} title={label} onChange={setOpen} />
    </section>
  );
}

function StaticChapter({ chapter, number, label }: { chapter: FolioChapterData; number: string; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section aria-label={label} className="px-[clamp(1.25rem,6vw,8rem)] py-[clamp(4rem,10vh,7rem)] text-white">
      <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/50">{number}</p>
      <h2 className="mt-2">
        <span className="block font-footer-display text-[clamp(2rem,4.6vw,4.5rem)] font-semibold leading-none tracking-[-0.045em] text-white">{label}</span>
      </h2>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[1.25rem]">
        <Image src={chapter.cover.src} alt={label} fill sizes="100vw" className={chapter.cover.fit === "contain" ? "object-contain p-[12%]" : "object-cover"} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {chapter.images.map((image, i) => (
          <FolioTile key={image.src} image={image} index={i} onOpen={setOpen} />
        ))}
      </div>
      <FolioLightbox images={chapter.images} index={open} title={label} onChange={setOpen} />
    </section>
  );
}
