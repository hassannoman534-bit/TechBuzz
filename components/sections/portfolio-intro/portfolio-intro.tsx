"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { Ribbon } from "./ribbon";
import { ReelCard } from "./reel-card";
import { JellyPlane } from "./jelly-plane";
import { portfolioIntro, type PortfolioIntroContent } from "./portfolio-intro.config";

type PortfolioIntroProps = { content?: PortfolioIntroContent; className?: string };

const SPRING = { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.0004 };
/** Under-damped on purpose: after a fast scroll the velocity overshoots and rings out, which is the jelly wobble */
const JELLY = { stiffness: 170, damping: 11, mass: 1 };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Narrow screens get a different start position. Read after mount, so SSR always matches. */
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = (): void => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

/**
 * Portfolio opening, after the reference's 5 to 10 second beat:
 * a centred bold heading, a ribbon that draws itself, and a small floating card that
 * bends like a flag (3D rotate + skew) while it grows into a full-width panel.
 * Pinned scroll scene; transform / opacity only, every value springs.
 */
export function PortfolioIntro({ content = portfolioIntro, className }: PortfolioIntroProps) {
  const reduce = useReducedMotionSafe();
  if (reduce) return <StaticIntro content={content} className={className} />;
  return <AnimatedIntro content={content} className={className} />;
}

function AnimatedIntro({ content, className }: Required<Pick<PortfolioIntroProps, "content">> & { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const narrow = useNarrow();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, SPRING);

  // Page scroll velocity → jelly. Shared by the card and the ribbon.
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), JELLY);

  // On load: the ribbon flows in and the card floats up.
  const intro = useMotionValue(0);
  useEffect(() => {
    const controls = animate(intro, 1, { duration: 1.8, ease: EASE, delay: 0.2 });
    return () => controls.stop();
  }, [intro]);

  // Heading leaves upward as the card takes over.
  const headY = useTransform(p, [0.04, 0.4], ["0vh", "-34vh"]);
  const headOpacity = useTransform(p, [0.12, 0.36], [1, 0]);
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0]);

  // Card path: small, low and to the side → centred, full size.
  const x = useTransform(p, [0.06, 0.62], narrow ? ["0vw", "0vw"] : ["-29vw", "0vw"]);
  const y = useTransform(p, [0.06, 0.62], narrow ? ["26svh", "0svh"] : ["29svh", "0svh"]);
  const scale = useTransform(p, [0.06, 0.62], narrow ? [0.46, 1] : [0.26, 1]);
  // How liquid the card is: gently rippling at rest, most fluid while it grows, flat once it lands.
  const energy = useTransform(p, [0, 0.08, 0.22, 0.5, 0.66], [0.5, 0.7, 1, 1, 0]);
  // A light turn in 3D adds perspective to the ripple.
  const rotateY = useTransform(p, [0.06, 0.3, 0.5, 0.66], [-6, 10, -6, 0]);
  const rotateX = useTransform(p, [0.06, 0.3, 0.5, 0.66], [6, -4, 3, 0]);
  const cardIn = useTransform(intro, [0, 1], [0, 1]);
  const cardRise = useTransform(intro, [0, 1], ["8svh", "0svh"]);

  return (
    <section
      ref={ref}
      aria-label={content.heading}
      className={cn("relative h-[320svh] bg-[#030712] text-white", className)}
    >
      <div className="sticky top-0 h-svh overflow-hidden [perspective:1600px]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgb(123_97_255/0.10),transparent_70%)]" />
        <Ribbon progress={p} velocity={velocity} intro={intro} />

        {/* Heading */}
        <motion.div style={{ y: headY, opacity: headOpacity, willChange: "transform, opacity" }} className="absolute inset-x-0 top-[44svh] z-10 flex -translate-y-1/2 flex-col items-center px-5 text-center md:top-[45svh]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/50"
          >
            ( {content.eyebrow} )
          </motion.p>
          <h1 className="mt-4 overflow-hidden pb-[0.08em] font-footer-display text-[clamp(3rem,10.5vw,10.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">
            {content.heading.split(" ").map((word, i) => (
              <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.09 }}
                >
                  {word}
                  {i < content.heading.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>
        </motion.div>

        {/* The card */}
        <div className="absolute inset-0 z-20 grid place-items-center">
          <motion.div style={{ opacity: cardIn, y: cardRise, willChange: "transform, opacity" }}>
            <motion.div
              style={{ x, y, scale, rotateX, rotateY, transformPerspective: 1600, willChange: "transform" }}
              className="relative aspect-[4/5] w-[92vw] rounded-[28px] md:aspect-video md:w-[min(92vw,142svh)]"
            >
              <JellyPlane
                slices={narrow ? 14 : 28}
                energy={energy}
                velocity={velocity}
                render={(i) => <ReelCard content={content} progress={p} decorative={i > 0} />}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.p
          style={{ opacity: hintOpacity }}
          className="absolute inset-x-0 bottom-6 z-30 text-center text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/40"
        >
          {content.scrollHint}
        </motion.p>
      </div>
    </section>
  );
}

/** Reduced motion: the finished composition, no pinning, no scroll animation. */
function StaticIntro({ content, className }: Required<Pick<PortfolioIntroProps, "content">> & { className?: string }) {
  const done = useMotionValue(1);
  return (
    <section aria-label={content.heading} className={cn("relative bg-[#030712] px-[4vw] pb-16 pt-[22svh] text-white", className)}>
      <div className="text-center">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/50">( {content.eyebrow} )</p>
        <h1 className="mt-4 font-footer-display text-[clamp(3rem,10.5vw,10.5rem)] font-bold leading-[0.9] tracking-[-0.05em]">{content.heading}</h1>
      </div>
      <div className="relative mx-auto mt-16 aspect-[4/5] w-full rounded-[28px] md:aspect-video md:w-[min(92vw,142svh)]">
        <ReelCard content={content} progress={done} />
      </div>
    </section>
  );
}
