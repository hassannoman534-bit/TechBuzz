"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useVelocity } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { WorkStack } from "./work-stack";
import { workList, type WorkListContent, type WorkListItem } from "./work-list.config";

type WorkListProps = {
  content?: WorkListContent;
  className?: string;
  /** Hide the big centred heading (e.g. when a page hero right above already has one) */
  hideHeading?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** Soft follow: the stack glides to the hovered row instead of snapping. */
const FOLLOW = { stiffness: 110, damping: 22, mass: 0.8 };
/** Scroll velocity for the fan-out, smoothed so it opens and settles gently. */
const FAN = { stiffness: 120, damping: 26, mass: 0.6 };

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

/** Phones: a small static version of the stack under the title (no hover on touch). */
function MiniStack({ item }: { item: WorkListItem }) {
  const slots = [
    { i: 1, cls: "-translate-y-[22%] -translate-x-[4%] -rotate-[7deg] z-[2]" },
    { i: 2, cls: "translate-y-[22%] translate-x-[4%] rotate-[7deg] z-[1]" },
    { i: 0, cls: "z-[3]" },
  ];
  return (
    <div aria-hidden className="relative mx-auto mb-10 mt-14 aspect-[4/3] w-[68%] md:hidden">
      {slots.map(({ i, cls }) => {
        const img = item.images?.[i];
        return (
          <div key={i} className={cn("absolute inset-0 overflow-hidden rounded-xl shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08)]", cls)} style={{ backgroundColor: item.color }}>
            {img ? (
              <Image src={img.src} alt="" fill sizes="70vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_35%_30%,rgb(255_255_255/0.16),transparent_70%)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Recent work as a staircase list: big titles stepping to the right, each with a numbered
 * marker. Hovering a row slides a stack of three overlapping cards in from the right
 * (centre card in front, one behind tilted up, one behind tilted down). The stack glides to
 * follow the hovered row, its images slide to that project, and scrolling fans the back cards
 * apart before they settle. Every motion is slow and eased; transform and opacity only.
 */
export function WorkList({ content = workList, className, hideHeading = false }: WorkListProps) {
  const reduce = useReducedMotionSafe();
  const fine = useFinePointer();
  const hoverMode = fine && !reduce;

  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  const target = useMotionValue(0);
  const stackY = useSpring(target, FOLLOW);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), FAN);

  const rowCenter = (el: HTMLElement): number => el.offsetTop + el.offsetHeight / 2;

  const onRowEnter = (i: number, e: PointerEvent<HTMLAnchorElement>): void => {
    if (!hoverMode) return;
    const li = e.currentTarget.parentElement as HTMLElement;
    // First entry: place the stack at the row immediately, then let it glide from there.
    if (!active) stackY.jump(rowCenter(li));
    target.set(rowCenter(li));
    setIndex(i);
    setActive(true);
  };

  return (
    <section
      id="work"
      aria-labelledby="work-list-heading"
      className={cn(
        "relative overflow-x-clip bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] pb-[clamp(5rem,12vh,9rem)] text-white",
        hideHeading ? "pt-4" : "pt-[clamp(5rem,12vh,9rem)]",
        className,
      )}
    >
      {hideHeading ? (
        <h2 id="work-list-heading" className="sr-only">
          {content.heading}
        </h2>
      ) : (
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
      )}

      <motion.p
        className="mb-[clamp(1.5rem,4vh,3rem)] text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/40"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: hideHeading ? 0.65 : 0 }}
      >
        {content.label}
      </motion.p>

      <ul onPointerLeave={() => setActive(false)} className="relative">
        {content.items.map((item, i) => {
          const isOn = active && index === i;
          const dim = active && index !== i;
          return (
            <motion.li
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 1.1, ease: EASE, delay: (hideHeading ? 0.75 : 0) + i * 0.1 }}
            >
              <Link
                href={item.href}
                onPointerEnter={(e) => onRowEnter(i, e)}
                onFocus={() => setIndex(i)}
                // staircase: each row steps a little further right
                style={{ ["--step" as string]: i }}
                className={cn(
                  "group relative block py-[clamp(0.9rem,2.2vw,1.6rem)] outline-none md:pl-[calc(var(--step)*clamp(1.25rem,3.6vw,3.75rem))]",
                  "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  dim && "opacity-30",
                  "focus-visible:opacity-100",
                )}
              >
                <span className="flex items-center gap-[clamp(0.9rem,2vw,1.75rem)]">
                  {/* number marker: fills with the brand gradient on hover */}
                  <span
                    aria-hidden
                    className={cn(
                      "relative grid size-[clamp(1.6rem,2.2vw,2.1rem)] shrink-0 place-items-center overflow-hidden rounded-full text-[clamp(0.65rem,0.8vw,0.8rem)] font-medium tabular-nums ring-1 transition-[color,box-shadow] duration-700",
                      isOn ? "text-white ring-transparent" : "text-white/55 ring-white/25",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOn ? "scale-100" : "scale-0",
                      )}
                    />
                    <span className="relative">{i + 1}</span>
                  </span>

                  <span
                    className={cn(
                      "font-footer-display text-[clamp(2rem,5.4vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-white",
                      "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOn && "md:translate-x-[clamp(0.75rem,1.6vw,1.5rem)]",
                    )}
                  >
                    {item.title}
                  </span>
                  <ArrowUpRight aria-hidden className="size-5 shrink-0 text-white/50 md:hidden" />
                </span>

                <span
                  className={cn(
                    "mt-1 block pl-[calc(clamp(1.6rem,2.2vw,2.1rem)+clamp(0.9rem,2vw,1.75rem))] text-[0.9rem] text-white/45 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "md:opacity-0 md:translate-y-1",
                    isOn && "md:translate-x-[clamp(0.75rem,1.6vw,1.5rem)] md:translate-y-0 md:opacity-100",
                  )}
                >
                  {item.services}
                </span>

                {!hoverMode && <MiniStack item={item} />}
              </Link>
            </motion.li>
          );
        })}

        {hoverMode && <WorkStack items={content.items} index={index} active={active} y={stackY} velocity={velocity} />}
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
    </section>
  );
}
