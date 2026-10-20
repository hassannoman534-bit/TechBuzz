"use client";

import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { WorkListItem } from "./work-list.config";

type WorkStackProps = {
  items: WorkListItem[];
  /** Hovered row (kept on the last one while the stack slides away) */
  index: number;
  active: boolean;
  /** Spring-smoothed vertical position of the stack's centre, in px from the list top */
  y: MotionValue<number>;
  /** Spring-smoothed scroll velocity (px/s): fans the back cards apart while scrolling */
  velocity: MotionValue<number>;
};

/** Card layout (fanned like a hand of cards): front card straight on top; the two back cards fan out to the right, one up and tilted clockwise, one down and tilted anticlockwise. */
const CARDS = [
  { slot: 0, z: 3, y: "0%", x: "0%", rotate: 0, delay: 0 }, // front (straight, on top)
  { slot: 1, z: 1, y: "-46%", x: "42%", rotate: 24, delay: 0.12 }, // top (behind, up and right, tilted clockwise)
  { slot: 2, z: 2, y: "40%", x: "42%", rotate: -22, delay: 0.2 }, // bottom (behind, down and right, tilted anticlockwise)
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const V_MAX = 2400;

/**
 * Three overlapping cards that slide in from the right when a row is hovered.
 * The back cards come out from behind the centre card a beat later. Each card holds a vertical
 * strip of every project's image, so switching rows slides the images instead of swapping them.
 * While the page scrolls, the back cards fan further apart and settle when scrolling stops.
 * Transform and opacity only.
 */
export function WorkStack({ items, index, active, y, velocity }: WorkStackProps) {
  const spread = useTransform(velocity, (v) => Math.max(-1, Math.min(1, v / V_MAX)));
  const topY = useTransform(spread, (s) => `${-Math.abs(s) * 9}%`);
  const topRot = useTransform(spread, (s) => Math.abs(s) * 5);
  const bottomY = useTransform(spread, (s) => `${Math.abs(s) * 9}%`);
  const bottomRot = useTransform(spread, (s) => -Math.abs(s) * 5);
  const scrollFan = [
    { y: undefined, rotate: undefined },
    { y: topY, rotate: topRot },
    { y: bottomY, rotate: bottomRot },
  ];

  return (
    <motion.div
      aria-hidden
      style={{ y, translateY: "-50%", willChange: "transform" }}
      className="pointer-events-none absolute right-[clamp(5rem,17vw,19rem)] top-0 z-20 hidden aspect-square w-[clamp(9.5rem,12.5vw,14rem)] md:block"
    >
      {CARDS.map((card) => (
        <motion.div
          key={card.slot}
          className="absolute inset-0"
          style={{ zIndex: card.z }}
          initial={false}
          animate={
            active
              ? { x: card.x, y: card.y, rotate: card.rotate, opacity: 1, scale: 1 }
              : { x: "135%", y: "0%", rotate: card.rotate * 1.6, opacity: 0, scale: 0.92 }
          }
          transition={{
            duration: active ? 1.25 : 0.9,
            ease: EASE,
            delay: active ? card.delay : (2 - card.slot) * 0.05,
          }}
        >
          {/* scroll fan: an extra layer so it adds to the hover position instead of replacing it */}
          <motion.div className="size-full" style={{ y: scrollFan[card.slot].y, rotate: scrollFan[card.slot].rotate }}>
            <div className="relative size-full overflow-hidden rounded-[18px] bg-[#0b0d1d] shadow-[0_30px_70px_-25px_rgb(0_0_0/0.95),0_0_0_1px_rgb(255_255_255/0.08)]">
              <div
                className="absolute inset-x-0 top-0 h-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateY(${-index * 100}%)`, transitionDelay: `${card.delay * 0.6}s` }}
              >
                {items.map((item) => {
                  const img = item.images?.[card.slot];
                  return (
                    <div key={item.title} className="relative h-full w-full" style={{ backgroundColor: item.color }}>
                      {img ? (
                        <Image src={img.src} alt="" fill sizes="14vw" className="object-cover" />
                      ) : (
                        <div
                          className="grid size-full place-items-center"
                          style={{
                            background: `radial-gradient(80% 70% at ${card.slot === 1 ? "70% 20%" : card.slot === 2 ? "30% 80%" : "35% 30%"}, rgb(255 255 255 / 0.16), transparent 70%)`,
                          }}
                        >
                          {card.slot === 0 && (
                            <span className="px-6 text-center font-footer-display text-[clamp(0.85rem,1.1vw,1.15rem)] font-semibold tracking-[-0.03em] text-white/85">
                              {item.title}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* soft inner light on the front card for depth */}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]" />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
