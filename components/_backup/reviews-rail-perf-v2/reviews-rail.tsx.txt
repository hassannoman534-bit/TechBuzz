"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import TeamLanyardRail from "@/components/ui/team-lanyard-rail";
import type { LanyardMember } from "@/components/ui/team-lanyard-rail";
import {
  badgeFace,
  EASE,
  reviews,
  reviewsContent,
  reviewsSource,
  type Review,
} from "./reviews-rail.config";

type ReviewsRailProps = {
  className?: string;
  /**
   * Badges turn themselves over one by one until the visitor touches one.
   * Only ever runs while the section is on screen. Pass false for a rail that
   * waits to be driven.
   */
  autoplay?: boolean;
};

function Stars({ rating }: { rating: number }): React.ReactElement {
  return (
    <span className="inline-flex items-center gap-[0.15em] align-middle" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-[0.85em] shrink-0">
          <path
            d="M10 1.6l2.47 5.26 5.53.79-4 4.03.95 5.72L10 14.7l-4.95 2.7.95-5.72-4-4.03 5.53-.79z"
            fill={i < rating ? "#22d8ff" : "rgba(255,255,255,0.18)"}
          />
        </svg>
      ))}
    </span>
  );
}

/**
 * Google reviews, above the footer on /services.
 *
 * The rail itself is components/ui/team-lanyard-rail, dropped in unmodified.
 * It was written for team badges, so the mapping is worth stating once:
 *
 *   name  -> the reviewer, or the subject of the review until a name is confirmed
 *   role  -> the star line
 *   team  -> the source
 *   bio   -> a sentence pulled out of the review (the back clamps to four lines)
 *   tags  -> what the review is about
 *   links -> through to the listing
 *
 * The badge is the teaser, not the testimonial: a 124px card cannot hold a
 * paragraph, so the full review is rendered underneath in the project's own
 * type, driven by the rail's controlled `active` and `flipped` props. That is
 * also why the rail is controlled rather than left to its own state.
 *
 * On faces: there are no reviewer photos, so `monogram()` draws one per badge
 * as a data URL. It keeps the borrowed component untouched and avoids four
 * identical grey silhouettes. Real avatars drop in through `avatar`.
 *
 * On cost: the rail runs a spring simulation on requestAnimationFrame, but only
 * while something is actually moving, and it parks itself at zero frames once
 * everything settles. Autoplay is the one thing that would keep waking it
 * forever, so it is gated on the section being in view and the component stops
 * it for good at the first interaction.
 */
export function ReviewsRail({ className, autoplay = true }: ReviewsRailProps): React.ReactElement {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const [active, setActive] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

  const items = useMemo<LanyardMember[]>(
    () =>
      reviews.map((review: Review) => ({
        id: review.id,
        name: review.author ?? review.topic,
        role: `${review.rating} star review`,
        team: reviewsSource.label,
        image: badgeFace(review),
        bio: review.pull,
        tags: review.tags,
        links: [{ label: "Google", href: reviewsSource.url }],
        tone: review.tone,
      })),
    [],
  );

  /*
    Same precedence the rail uses for its own caption (active ?? flipped). They
    have to agree: picked the other way round, the caption named one review
    while the quote under it was a different one, which is reachable just by
    hovering a second badge while the first is still turned over.
  */
  const selected = active ?? flipped;
  const review = selected === null ? null : reviews[selected] ?? null;

  const onActiveChange = useCallback((index: number | null) => {
    setActive(index);
    // Turn a stale badge back when attention moves. Hover only sets active, so
    // without this the rail ends up with two badges open at once.
    setFlipped((current) => (current !== null && current !== index ? null : current));
  }, []);
  const onFlippedChange = useCallback((index: number | null) => setFlipped(index), []);

  return (
    <div ref={ref} data-atmo="quiet">
      <TeamLanyardRail
        items={items}
        eyebrow={reviewsContent.eyebrow}
        heading={reviewsContent.heading}
        caption={reviewsContent.caption}
        labels={reviewsContent.labels}
        autoplay={autoplay && inView && !reduce}
        active={active}
        onActiveChange={onActiveChange}
        flipped={flipped}
        onFlippedChange={onFlippedChange}
        className={cn("py-[clamp(2.5rem,7vh,5rem)]", className)}
        /*
          Contained rather than full bleed. The rail is inset-x-0 inside its
          stage, so an unconstrained section mounts it to the window edges with
          its end brackets hard against the glass, and four badges adrift in the
          middle of 1900px of empty rail. Inline, not a Tailwind arbitrary
          value: arbitrary values have been dropped from this build before, and
          losing this one changes the composition. Below 76rem it does nothing,
          so the phone carousel keeps the full width it needs.
        */
        style={{ maxWidth: "76rem", marginInline: "auto" }}
        action={
          // Inline max width, not a Tailwind arbitrary value: this is the
          // measure of the quote and arbitrary values have been dropped from
          // this project's build before.
          <div className="w-full px-[clamp(0.25rem,2vw,1rem)]" style={{ maxWidth: "46rem" }}>
            {/*
              The badge back only has room for one sentence, so the review lives
              here. Height is allowed to change: this sits directly above the
              footer, so a taller quote moves the footer down and nothing else.
            */}
            <div className="min-h-[clamp(5.5rem,9vh,6.5rem)]">
              <AnimatePresence mode="wait" initial={false}>
                {review ? (
                  <motion.figure
                    key={review.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={reduce ? { duration: 0.01 } : { duration: 0.4, ease: EASE }}
                  >
                    <blockquote
                      className="font-footer-text text-balance text-[clamp(0.95rem,1.15vw,1.08rem)] leading-relaxed text-white/80"
                      cite={reviewsSource.url}
                    >
                      {review.quote}
                    </blockquote>
                    <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.72rem] uppercase tracking-[0.2em] text-white/40">
                      <Stars rating={review.rating} />
                      <span>{review.author ?? `${reviewsSource.label} review`}</span>
                    </figcaption>
                  </motion.figure>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.01 } : { duration: 0.35, ease: EASE }}
                    className="font-footer-text text-[clamp(0.95rem,1.15vw,1.08rem)] leading-relaxed text-white/35"
                  >
                    {reviewsContent.idle}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div aria-hidden className="horizon mx-auto mt-6 w-full max-w-[22rem]" />

            <a
              href={reviewsSource.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[0.82rem] font-medium text-white/70 transition-colors duration-300 hover:border-white/20 hover:text-white focus-visible:border-white/20"
            >
              <Stars rating={5} />
              <span className="tabular-nums">
                {reviewsSource.rating} from {reviewsSource.count} reviews on {reviewsSource.label}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="size-3.5 shrink-0 text-white/35 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 11 11 5M6.2 5H11v4.8" />
              </svg>
              <span className="sr-only">{reviewsContent.linkLabel}</span>
            </a>
          </div>
        }
      />
    </div>
  );
}

export default ReviewsRail;
