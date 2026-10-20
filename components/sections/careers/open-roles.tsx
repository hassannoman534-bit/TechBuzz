"use client";

import Link from "next/link";
import { useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { useFinePointer } from "@/lib/use-fine-pointer";
import { RolePreview } from "./role-preview";
import type { CareersContent } from "./careers.config";

type OpenRolesProps = { content: CareersContent["roles"]; className?: string };

/** Box trails the pointer; the cursor is quicker, so they separate in motion and meet at rest */
const BOX_SPRING = { stiffness: 140, damping: 22, mass: 0.6 };
const CURSOR_SPRING = { stiffness: 300, damping: 28, mass: 0.45 };
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Open roles as a hover-reveal list (same motion as the first portfolio work list).
 * Full-width rows with big role names. On desktop, hovering a row opens a floating card that
 * follows the pointer and slides between roles, with a round "Apply" cursor on top; the hovered
 * row fades and its two sides ease apart. On touch screens rows are plain links with an arrow.
 */
export function OpenRoles({ content, className }: OpenRolesProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const hoverMode = fine && !reduce;

  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const boxX = useSpring(x, BOX_SPRING);
  const boxY = useSpring(y, BOX_SPRING);
  const cursorX = useSpring(x, CURSOR_SPRING);
  const cursorY = useSpring(y, CURSOR_SPRING);

  const onMove = (e: PointerEvent<HTMLUListElement>): void => {
    if (!hoverMode) return;
    x.set(e.clientX);
    y.set(e.clientY);
  };
  // Jump (no spring) to the entry point, so the preview never flies in from the corner.
  const onEnterList = (e: PointerEvent<HTMLUListElement>): void => {
    if (!hoverMode) return;
    [x, boxX, cursorX].forEach((m) => m.jump(e.clientX));
    [y, boxY, cursorY].forEach((m) => m.jump(e.clientY));
  };

  return (
    <section
      id="open-roles"
      aria-labelledby="open-roles-heading"
      className={cn("relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(5rem,12vh,9rem)] pt-[clamp(2rem,6vh,4rem)] text-white", className)}
    >
      <motion.div
        className="mb-[clamp(2rem,5vh,3.5rem)] flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:px-[clamp(1rem,4vw,4rem)]"
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <h2 id="open-roles-heading" className="font-footer-display text-[clamp(2.25rem,4.6vw,4.5rem)] font-medium leading-none tracking-[-0.04em]">
          {content.heading}
          <sup className="ml-2 align-super text-[0.35em] font-medium tracking-normal text-white/45">{content.items.length}</sup>
        </h2>
        <p className="text-[0.95rem] text-white/50">
          {content.note.text}{" "}
          <Link href={content.note.href} className="text-white underline decoration-white/30 underline-offset-4 transition-colors duration-500 hover:decoration-[#7b61ff]">
            {content.note.linkLabel}
          </Link>
        </p>
      </motion.div>

      <ul onPointerEnter={onEnterList} onPointerMove={onMove} onPointerLeave={() => setActive(false)} className="border-b border-white/10">
        {content.items.map((role, i) => (
          <motion.li
            key={role.title}
            className="border-t border-white/10"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -6% 0px" }}
            transition={{ duration: 1.1, ease: EASE, delay: Math.min(i, 4) * 0.07 }}
          >
            <Link
              href={role.href}
              aria-label={`${role.title}, ${role.team}${role.type ? `, ${role.type}` : ""}. Apply`}
              onPointerEnter={() => {
                if (!hoverMode) return;
                setIndex(i);
                setActive(true);
              }}
              onFocus={() => setIndex(i)}
              className="group relative flex items-center justify-between gap-6 py-[clamp(1.4rem,3.4vw,2.9rem)] outline-none focus-visible:bg-white/[0.03] md:px-[clamp(1rem,4vw,4rem)]"
            >
              <h3 className="font-footer-display text-[clamp(1.75rem,5vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.035em] text-white transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:-translate-x-3 md:group-hover:opacity-40">
                {role.title}
              </h3>
              <p className="flex shrink-0 items-center gap-2 text-right text-[0.85rem] text-white/60 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:text-[1.05rem] md:group-hover:translate-x-3 md:group-hover:opacity-40">
                <span className="hidden sm:inline">
                  {role.team}
                  {role.type && <span className="text-white/35"> · {role.type}</span>}
                </span>
                <ArrowUpRight aria-hidden className="size-5 md:hidden" />
              </p>
            </Link>
          </motion.li>
        ))}
      </ul>

      {hoverMode && (
        <RolePreview
          roles={content.items}
          index={index}
          active={active}
          boxX={boxX}
          boxY={boxY}
          cursorX={cursorX}
          cursorY={cursorY}
          cursorLabel={content.cursorLabel}
        />
      )}
    </section>
  );
}
