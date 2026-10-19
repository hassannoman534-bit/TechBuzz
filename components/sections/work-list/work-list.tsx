"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { HoverPreview } from "./hover-preview";
import { workList, type WorkListContent } from "./work-list.config";

type WorkListProps = { content?: WorkListContent; className?: string };

/** Box trails the pointer; the cursor is quicker, so they separate in motion and meet at rest */
const BOX_SPRING = { stiffness: 150, damping: 20, mass: 0.5 };
const CURSOR_SPRING = { stiffness: 320, damping: 26, mass: 0.4 };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Desktop pointers only. Read after mount, so the server and client HTML always match. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = (): void => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * Hover-reveal project list (after the "Recent work" list on dennissnellenberg.com).
 * Big project names in full-width rows. On desktop, hovering a row opens a floating preview
 * that follows the pointer and slides between projects, with a round "View" cursor on top.
 * The hovered row fades and its text eases apart. On touch screens each row shows its
 * image inline instead, so nothing depends on hover.
 */
export function WorkList({ content = workList, className }: WorkListProps) {
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
      id="work"
      aria-labelledby="work-list-heading"
      className={cn("relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(5rem,12vh,9rem)] pt-[clamp(5rem,12vh,9rem)] text-white", className)}
    >
      <h2
        id="work-list-heading"
        className="mb-[clamp(3rem,8vh,6rem)] overflow-hidden pb-[0.08em] text-center font-footer-display text-[clamp(3rem,8.5vw,8.5rem)] font-bold leading-[0.9] tracking-[-0.045em]"
      >
        <motion.span
          className="inline-block"
          initial={reduce ? false : { y: "105%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {content.heading}
        </motion.span>
      </h2>

      <p className="mb-6 pl-[clamp(0rem,4vw,4rem)] text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/40">{content.label}</p>

      <ul
        onPointerEnter={onEnterList}
        onPointerMove={onMove}
        onPointerLeave={() => setActive(false)}
        className="border-b border-white/10"
      >
        {content.items.map((item, i) => (
          <li key={item.title} className="border-t border-white/10">
            <Link
              href={item.href}
              onPointerEnter={() => {
                if (!hoverMode) return;
                setIndex(i);
                setActive(true);
              }}
              onFocus={() => setIndex(i)}
              className="group relative flex flex-col gap-4 py-[clamp(1.75rem,4.5vw,3.75rem)] outline-none focus-visible:bg-white/[0.03] md:flex-row md:items-center md:justify-between md:px-[clamp(1rem,4vw,4rem)]"
            >
              {/* Touch screens: image inline (no hover there) */}
              {!hoverMode && (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl md:hidden" style={{ backgroundColor: item.color }}>
                  {item.image ? (
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="100vw" className="object-cover" />
                  ) : (
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_25%,rgb(255_255_255/0.12),transparent_70%)]" />
                  )}
                </div>
              )}

              <h3 className="font-footer-display text-[clamp(2.25rem,6.2vw,6rem)] font-medium leading-[1] tracking-[-0.035em] text-white transition-[translate,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:-translate-x-3 md:group-hover:opacity-40">
                {item.title}
              </h3>
              <p className="flex items-center gap-2 text-[0.95rem] text-white/70 transition-[translate,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:text-[1.05rem] md:group-hover:translate-x-3 md:group-hover:opacity-40">
                {item.services}
                <ArrowUpRight aria-hidden className="size-4 md:hidden" />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {content.more && (
        <div className="mt-[clamp(3rem,7vh,5rem)] flex justify-center">
          <Link
            href={content.more.href}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-9 py-4 text-[0.95rem] text-white ring-1 ring-white/20 outline-none transition-colors duration-500 hover:text-white focus-visible:ring-white/60 [isolation:isolate]"
          >
            <span aria-hidden className="absolute inset-x-[-10%] top-full -z-10 aspect-square rounded-[45%] bg-[linear-gradient(140deg,#7b61ff,#5b7cff)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[60%] group-focus-visible:-translate-y-[60%]" />
            {content.more.label}
            <sup aria-hidden className="text-[0.65rem]">{content.items.length}</sup>
          </Link>
        </div>
      )}

      {hoverMode && (
        <HoverPreview
          items={content.items}
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
