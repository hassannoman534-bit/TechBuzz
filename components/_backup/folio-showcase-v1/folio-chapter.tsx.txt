"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import type { FolioChapterData } from "./folio-library";

/*
 * Timeline, as a share of the chapter's pinned scroll (0 = stage pins, 1 = it releases):
 * the cover grows from a small card to full screen while the title words slide apart,
 * then the film strip of the folio rises and drifts across.
 */
const EXPAND: [number, number] = [0.04, 0.5];
const VEIL: [number, number] = [0.48, 0.6];
const STRIP_IN: [number, number] = [0.52, 0.64];
const STRIP_MOVE: [number, number] = [0.56, 1];
const LENGTH_VH = 320; // section height

/** Start card size: 300 x 400 on desktop, scaled down on small screens */
const CARD_W = 300;
const CARD_H = 400;
const RADIUS = 22;

type FolioChapterProps = {
  chapter: FolioChapterData;
  index: number;
  total: number;
};

export function FolioChapter({ chapter, index, total }: FolioChapterProps) {
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const size = useRef({ w: 1440, h: 900, strip: 0 });

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
  const coverScale = useTransform(eased, [0, 1], [1.3, 1]);
  const bgOpacity = useTransform(eased, [0, 1], [1, 0]);
  const apartL = useTransform(eased, (t) => `${-t * 42}vw`);
  const apartR = useTransform(eased, (t) => `${t * 42}vw`);
  const titleOpacity = useTransform(p, [EXPAND[1] - 0.08, EXPAND[1]], [1, 0]);
  const veil = useTransform(p, VEIL, [0, 1]);
  const stripOpacity = useTransform(p, STRIP_IN, [0, 1]);
  const stripY = useTransform(p, STRIP_IN, ["12svh", "0svh"]);
  const stripX = useTransform(p, (v) => {
    const { w, strip } = size.current;
    const t = Math.min(1, Math.max(0, (v - STRIP_MOVE[0]) / (STRIP_MOVE[1] - STRIP_MOVE[0])));
    const start = w * 0.35;
    const end = -(strip - w * 0.75);
    return start + (Math.min(end, 0) - start) * t;
  });

  const number = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const label = `${chapter.title[0]}${chapter.title[1].startsWith("folio") ? "" : " "}${chapter.title[1]}`;

  if (reduce) return <StaticChapter chapter={chapter} number={number} label={label} />;

  return (
    <section ref={sectionRef} aria-label={label} className="relative" style={{ height: `${LENGTH_VH}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden bg-[#030712]">
        {/* soft backdrop: this folio's background (or the cover), huge and dim, gone once the card fills the screen */}
        <motion.div aria-hidden style={{ opacity: bgOpacity }} className="absolute inset-0">
          <Image
            src={chapter.background ?? chapter.cover}
            alt=""
            fill
            sizes="100vw"
            className={chapter.background ? "scale-110 object-cover object-center opacity-[0.32]" : "scale-125 object-cover opacity-[0.18]"}
          />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent,#030712_85%)]" />
        </motion.div>

        {/* the cover: one full screen layer, clipped from a card to the whole screen */}
        <motion.div style={{ clipPath }} className="absolute inset-0 will-change-[clip-path]">
          <motion.div style={{ scale: coverScale }} className="absolute inset-0">
            <Image src={chapter.cover} alt={label} fill sizes="100vw" priority={index === 0} className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-black/25" />
          <motion.div style={{ opacity: veil }} className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_7_18/0.55),rgb(3_7_18/0.92))]" />
        </motion.div>

        {/* title words slide apart over the growing card */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-[0.15em] font-footer-display text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white mix-blend-difference"
        >
          <motion.span style={{ x: apartL }} className="block whitespace-nowrap">
            {chapter.title[0]}
          </motion.span>
          <motion.span style={{ x: apartR }} className="block whitespace-nowrap">
            {chapter.title[1]}
          </motion.span>
        </motion.div>

        {/* small captions under the card, sliding apart too */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[clamp(2rem,9svh,5rem)] flex items-center justify-center gap-6 font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/60"
        >
          <motion.span style={{ x: apartL }}>{number}</motion.span>
          <motion.span style={{ x: apartR }}>{chapter.caption}</motion.span>
        </motion.div>

        {/* expanded state: heading + film strip */}
        <motion.div style={{ opacity: stripOpacity, y: stripY }} className="absolute inset-0 flex flex-col justify-end pb-[clamp(2rem,7svh,4.5rem)]">
          <div className="mb-[clamp(1.25rem,4svh,2.5rem)] flex items-end justify-between gap-6 px-[clamp(1.25rem,6vw,8rem)] text-white">
            <div>
              <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/50">{number}</p>
              <p className="mt-2 font-footer-display text-[clamp(2rem,4.6vw,4.5rem)] font-semibold leading-none tracking-[-0.045em]">{label}</p>
            </div>
            <p className="shrink-0 font-footer-text text-[0.8rem] text-white/55">{chapter.count} pieces</p>
          </div>
          <motion.div ref={stripRef} style={{ x: stripX }} className="flex w-max gap-[clamp(0.75rem,1.4vw,1.25rem)] will-change-transform">
            {chapter.images.map((src) => (
              <div key={src} className="relative h-[clamp(11rem,34svh,22rem)] aspect-[4/5] shrink-0 overflow-hidden rounded-[1rem] bg-white/[0.03] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
                <Image src={src} alt="" fill sizes="(min-width: 1024px) 22vw, 40vw" className="object-cover" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StaticChapter({ chapter, number, label }: { chapter: FolioChapterData; number: string; label: string }) {
  return (
    <section aria-label={label} className="px-[clamp(1.25rem,6vw,8rem)] py-[clamp(4rem,10vh,7rem)] text-white">
      <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/50">{number}</p>
      <h2 className="mt-2">
        <span className="block font-footer-display text-[clamp(2rem,4.6vw,4.5rem)] font-semibold leading-none tracking-[-0.045em] text-white">{label}</span>
      </h2>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[1.25rem]">
        <Image src={chapter.cover} alt={label} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {chapter.images.map((src) => (
          <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[0.9rem]">
            <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

