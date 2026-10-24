"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

export type TunnelProject = {
  src: string;
  title: string;
};

type PerspectiveTunnelHeroProps = {
  projects?: TunnelProject[];
};

// Real TechBuzz project images in /public/assets/portfolio/.
// Only the Sultan Yakhni Pulao food photo existed as a genuine project visual in
// public/assets/library/ (the rest were stock photos, logos, SEO screenshots and blog
// covers). Drop real images in and add entries here for the other clients:
//   Signia Glam, Secure Glaze, The Texture Beauty, Quality Windows, FoodBuzz.
const DEFAULT_PROJECTS: TunnelProject[] = [
  { src: "/assets/portfolio/sultan-yakhni-pulao.webp", title: "Sultan Yakhni Pulao" },
];

type TunnelCardData = {
  item: TunnelProject;
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
  index: number;
};

type Stage = {
  width: number;
  height: number;
  isMobile: boolean;
  isTouch: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const POINTER_SPRING = { stiffness: 60, damping: 25, mass: 0.5 };

const HEADLINE = ["Brands & experiences", "worth remembering."];

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useStage(): Stage {
  const [stage, setStage] = useState<Stage>({
    width: 1440,
    height: 900,
    isMobile: false,
    isTouch: false,
  });

  useEffect(() => {
    const update = () =>
      setStage({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTouch: window.matchMedia("(pointer: coarse)").matches,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return stage;
}

function usePointerParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, POINTER_SPRING);
  const y = useSpring(rawY, POINTER_SPRING);

  useEffect(() => {
    if (!enabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);

  return { x, y };
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

type TunnelCardProps = {
  card: TunnelCardData;
  total: number;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  stage: Stage;
};

function TunnelCard({ card, total, progress, pointer, stage }: TunnelCardProps) {
  const span = 0.55;
  const start = (card.index / total) * (1 - span);
  const local = useTransform(progress, [start, start + span], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1600;
  const nearZ = stage.isMobile ? 320 : 450;
  const z = useTransform(local, [0, 1], [farZ, nearZ]);
  const opacity = useTransform(local, [0, 0.15, 0.8, 0.95], [0, 1, 1, 0]);

  const width = stage.isMobile
    ? Math.max(130, Math.min(180, stage.width * 0.38))
    : Math.max(180, Math.min(260, stage.width * 0.17));

  const baseX = card.angleCos * stage.width * card.radiusFactorX;
  const baseY = card.angleSin * stage.height * card.radiusFactorY;
  const pan = stage.isMobile ? 16 : 40;

  const transform = useTransform(
    [z, pointer.x, pointer.y],
    ([currZ, px, py]: number[]) =>
      `translate3d(calc(-50% + ${baseX - px * pan}px), calc(-50% + ${
        baseY - py * pan
      }px), ${currZ}px) rotateZ(${card.rotationZ}deg)`
  );

  return (
    <motion.div
      style={{ width, transform, opacity, zIndex: card.index + 1 }}
      className="absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 shadow-2xl shadow-black/80 transition-[box-shadow,ring-color] duration-500 hover:ring-[#38bdf8]/60">
        <Image
          src={card.item.src}
          alt={card.item.title}
          fill
          sizes="(max-width: 768px) 180px, 260px"
          draggable={false}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/10 to-transparent p-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#F2F2F0]">
            {card.item.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export default function PerspectiveTunnelHero({
  projects = DEFAULT_PROJECTS,
}: PerspectiveTunnelHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const stage = useStage();

  // Normal page scroll drives the tunnel: the hero pins for 300vh, then the page continues.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 30,
    restDelta: 0.0005,
  });
  const staticProgress = useMotionValue(0.45);
  const progress = reduce ? staticProgress : smooth;

  const pointer = usePointerParallax(!reduce && !stage.isTouch);

  const cards = useMemo<TunnelCardData[]>(() => {
    const list = stage.isMobile ? projects.slice(0, 6) : projects;
    return list.map((item, i) => {
      const angle = i * 137.5 * (Math.PI / 180);
      return {
        item,
        angleCos: Math.cos(angle),
        angleSin: Math.sin(angle),
        radiusFactorX: 0.28 + (i % 3) * 0.08,
        radiusFactorY: 0.26 + (i % 2) * 0.09,
        rotationZ: (i % 2 === 0 ? 1 : -1) * (2 + (i % 4) * 1.5),
        index: i,
      };
    });
  }, [projects, stage.isMobile]);

  const titleScale = useTransform(progress, [0, 1], [1, 1.12]);
  const titleOpacity = useTransform(progress, [0, 0.7, 0.9], [1, 1, 0]);
  const hintOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className={`relative bg-[#030712] ${reduce ? "h-[100svh]" : "h-[300vh]"}`}
    >
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden text-[#F2F2F0]"
        style={{ perspective: stage.isMobile ? "900px" : "1200px" }}
      >
        {/* Ambient light + dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_55%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.07)_0%,transparent_60%)]" />

        {/* Depth rings */}
        <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-white/[0.06]" />
        <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-white/[0.05]" />

        {/* 3D plane */}
        <div
          className="pointer-events-none absolute inset-0 z-10 [&>*]:pointer-events-auto"
          style={{ transformStyle: "preserve-3d" }}
        >
          {cards.map((card) => (
            <TunnelCard
              key={`${card.item.title}-${card.index}`}
              card={card}
              total={cards.length}
              progress={progress}
              pointer={pointer}
              stage={stage}
            />
          ))}
        </div>

        {/* Copy — sits above the cards for legibility */}
        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none relative z-20 flex max-w-3xl flex-col items-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#8A8F98]"
          >
            ( Brand · Build · Growth )
          </motion.p>

          <h1 className="font-[family-name:var(--font-sans)] text-[clamp(44px,8vw,128px)] font-medium leading-[0.95] tracking-[-0.045em]">
            {HEADLINE.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
            className="mt-6 max-w-[44ch] text-base leading-relaxed text-[#8A8F98] md:text-lg"
          >
            Strategy, design, engineering and growth marketing for restaurants, retail and
            technology brands. Lahore to worldwide, since 2019.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
            className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/contact"
              className="rounded-full bg-[#38bdf8] px-6 py-3 text-sm font-medium text-[#030712] transition-transform duration-300 hover:scale-[1.03]"
            >
              Book a strategy call
            </Link>
            <Link
              href="/portfolio"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#F2F2F0] transition-colors duration-300 hover:border-white/40"
            >
              See our work
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        {!reduce && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-[#8A8F98]"
          >
            <span>Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-[#8A8F98] to-transparent" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
