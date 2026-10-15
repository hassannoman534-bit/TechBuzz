"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { ServiceCard } from "./service-card";
import { servicesContent, type ServicesContent } from "./services.config";

type ServicesAccordionProps = {
  content?: ServicesContent;
  className?: string;
};

const HOVER_INTENT_MS = 70;

/**
 * Services list in the Cuberto style:
 * - scrolling opens each card in turn (one open at a time)
 * - hovering a card opens it; leaving the list hands control back to scroll
 * - clicking/tapping or keyboard focus opens a card until the scroll moves on
 */
export function ServicesAccordion({ content = servicesContent, className }: ServicesAccordionProps) {
  const { services } = content;
  const listRef = useRef<HTMLUListElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll drives the open card: progress of the list past an anchor 60% down the viewport.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.6", "end 0.6"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(services.length - 1, Math.max(0, Math.floor(v * services.length)));
    setScrollIndex((prev) => (prev === next ? prev : next));
  });

  const cancelPending = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);

  const release = useCallback(() => {
    cancelPending();
    setHoverIndex(null);
  }, [cancelPending]);

  // Scrolling always takes control back: when the scroll moves to another card, any hover or tap choice ends.
  useEffect(() => {
    release();
    setManualIndex(null);
  }, [scrollIndex, release]);

  /**
   * Hover = REAL mouse movement only. When the page scrolls under a resting cursor, browsers fire
   * synthetic pointer events with zero movement; those are ignored so scrolling never opens the card
   * that happens to slide under the mouse.
   */
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLUListElement>) => {
      if (e.pointerType !== "mouse" || (e.movementX === 0 && e.movementY === 0)) return;
      const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-index]");
      if (!li) return; // in the gap between cards: keep the current card
      const i = Number(li.dataset.index);
      if (i === hoverIndex && !hoverTimer.current) return;
      cancelPending();
      // Hover intent: short delay so sweeping across the list doesn't flicker cards open.
      // When it fires, only open if the mouse is genuinely still over that card.
      hoverTimer.current = setTimeout(() => {
        hoverTimer.current = null;
        if (li.matches(":hover")) setHoverIndex(i);
      }, HOVER_INTENT_MS);
    },
    [hoverIndex, cancelPending],
  );

  // Safety net for missed "leave" events (fast exits, scrolling out from under the cursor, tab switch).
  const hoverActive = hoverIndex !== null;
  useEffect(() => {
    const list = listRef.current;
    const check = (e: PointerEvent): void => {
      if (!list || list.contains(e.target as Node)) return;
      if (hoverTimer.current || hoverActive) release();
    };
    const onBlur = (): void => release();
    document.addEventListener("pointermove", check, { passive: true });
    document.documentElement.addEventListener("pointerleave", onBlur);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointermove", check);
      document.documentElement.removeEventListener("pointerleave", onBlur);
      window.removeEventListener("blur", onBlur);
    };
  }, [hoverActive, release]);

  useEffect(() => cancelPending, [cancelPending]);

  const select = useCallback((i: number) => setManualIndex(i), []);

  const activeIndex = hoverIndex ?? manualIndex ?? scrollIndex;
  const count = String(services.length).padStart(2, "0");

  return (
    <section
      id="services"
      data-atmo="services"
      aria-labelledby="services-heading"
      className={cn(
        "relative isolate px-[clamp(1.25rem,4vw,4rem)] py-[clamp(6rem,12vw,10rem)]",
        // Row and open heights for the cards (open height fits the longest description)
        "[--svc-row:clamp(4.25rem,6.4vw,6.25rem)] [--svc-open:clamp(19.5rem,25vw,22.5rem)] max-md:[--svc-open:20.5rem]",
        className,
      )}
    >
      <div className="mx-auto max-w-[1360px]">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-[clamp(3rem,6vw,5.5rem)] grid gap-8 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-8">
            <p className="font-signature-serif text-[0.8rem] uppercase tracking-[0.24em] text-ink-muted">{content.eyebrow}</p>
            <h2
              id="services-heading"
              className="mt-5 font-signature text-[clamp(2.6rem,6.2vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-ink"
            >
              {content.heading.lead} <span className="text-spectrum">{content.heading.highlight}</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:pb-2">
            <p className="max-w-[36ch] font-signature text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.6] text-ink-muted">{content.intro}</p>
            <p className="mt-5 font-signature text-[0.8rem] font-medium tracking-[0.08em] text-ink-faint">
              {count} Services
            </p>
          </div>
        </motion.header>

        {/* List */}
        {/*
          Fixed-height list: exactly one card is open, so total height is constant and declared up front.
          With layout containment, cards resizing inside never trigger layout for the rest of the page.
        */}
        <ul
          ref={listRef}
          onPointerMove={onPointerMove}
          onPointerLeave={release}
          style={{ ["--svc-n" as string]: services.length }}
          className="flex h-[calc(var(--svc-n)*var(--svc-row)+(var(--svc-n)-1)*0.75rem+var(--svc-open)-var(--svc-row))] flex-col gap-3"
        >
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} active={i === activeIndex} onSelect={select} />
          ))}
        </ul>
      </div>
    </section>
  );
}
