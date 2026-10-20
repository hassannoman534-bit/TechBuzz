"use client";

import { motion, type MotionValue } from "framer-motion";
import {
  Briefcase,
  Clapperboard,
  Compass,
  Handshake,
  MousePointerClick,
  PenTool,
  Search,
  Share2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import type { CareerRole, RoleIcon } from "./careers.config";

const ROLE_ICONS: Record<RoleIcon, LucideIcon> = {
  social: Share2,
  account: Handshake,
  consultant: Compass,
  ecommerce: ShoppingBag,
  design: PenTool,
  ppc: MousePointerClick,
  seo: Search,
  video: Clapperboard,
  other: Briefcase,
};

type RolePreviewProps = {
  roles: CareerRole[];
  /** Index of the row under the pointer (kept on the last row while closing) */
  index: number;
  active: boolean;
  /** Pointer position (viewport px), spring-smoothed; two speeds give the lag between box and cursor */
  boxX: MotionValue<number>;
  boxY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  cursorLabel: string;
};

const EASE = [0.76, 0, 0.24, 1] as const;
const SCALE = {
  open: { scale: 1, transition: { duration: 0.5, ease: EASE } },
  closed: { scale: 0, transition: { duration: 0.45, ease: EASE } },
};

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Floating preview that follows the pointer over the roles list (same motion as the first
 * work list). The box is a window onto a vertical strip of role cards; the strip slides to the
 * hovered row, so moving between rows scrolls the cards. A round "Apply" cursor follows a
 * little faster, so the two drift apart in motion and meet at rest.
 * Fixed position, transform only, pointer-events none.
 */
export function RolePreview({ roles, index, active, boxX, boxY, cursorX, cursorY, cursorLabel }: RolePreviewProps) {
  const state = active ? "open" : "closed";
  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: boxX, y: boxY, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
      >
        <motion.div
          variants={SCALE}
          initial="closed"
          animate={state}
          className="relative h-[clamp(14rem,19vw,19rem)] w-[clamp(17rem,24vw,24rem)] overflow-hidden rounded-[14px] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08)]"
        >
          <div
            className="absolute inset-x-0 top-0 h-full transition-transform duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ transform: `translateY(${-index * 100}%)` }}
          >
            {roles.map((role, i) => {
              const Icon = ROLE_ICONS[role.icon];
              return (
                <div key={role.title} className="relative flex h-full w-full flex-col justify-between p-[clamp(1.1rem,1.6vw,1.6rem)]" style={{ backgroundColor: role.color }}>
                  <div className="absolute inset-0 bg-[radial-gradient(80%_75%_at_85%_10%,rgb(255_255_255/0.14),transparent_65%)]" />
                  <div className="relative flex items-start justify-between">
                    <span className="grid size-[clamp(2.75rem,3.6vw,3.5rem)] place-items-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] ring-1 ring-white/15">
                      <Icon className="size-[45%]" strokeWidth={1.6} />
                    </span>
                    <span className="text-[0.75rem] tabular-nums text-white/55">
                      {pad(i + 1)} / {pad(roles.length)}
                    </span>
                  </div>
                  <div className="relative">
                    <p className="font-footer-display text-[clamp(1.2rem,1.6vw,1.6rem)] font-semibold leading-tight tracking-[-0.03em] text-white">{role.title}</p>
                    <p className="mt-1.5 line-clamp-3 text-[clamp(0.8rem,0.85vw,0.9rem)] leading-snug text-white/70">{role.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", willChange: "transform" }}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
      >
        <motion.div
          variants={SCALE}
          initial="closed"
          animate={state}
          className="grid size-20 place-items-center rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] text-[0.85rem] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_16px_40px_-12px_rgb(123_97_255/0.8)]"
        >
          {cursorLabel}
        </motion.div>
      </motion.div>
    </>
  );
}
