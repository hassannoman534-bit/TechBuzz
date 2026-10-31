import { ArrowRightIcon } from "lucide-react";
import { GlassButton } from "@/components/ui/GlassButton";
import { cn } from "@/lib/utils";
import { PerspectiveRow } from "./perspective-row";
import { ServiceCard } from "./service-card";
import { buildShowcaseCards, showcaseContent, type ShowcaseContent } from "./services-showcase.config";

/** Grid width: two large cards per row, one row in focus at a time.
 * Inline (not a Tailwind arbitrary class) so it can never be dropped by the class scanner. */
const GRID_WIDTH = "min(100%, clamp(20rem, min(44vw, 82svh), 50rem))";

type ServicesShowcaseProps = { content?: ShowcaseContent; className?: string };

/**
 * Services grid with the perspective scroll effect: two columns, each row tilts and fans in from below,
 * settles flat in the middle of the screen and tilts away above. Server component; only the rows and
 * cards are client code.
 */
export function ServicesShowcase({ content = showcaseContent, className }: ServicesShowcaseProps) {
  const cards = buildShowcaseCards(content);
  const rows: (typeof cards)[] = [];
  for (let i = 0; i < cards.length; i += 2) rows.push(cards.slice(i, i + 2));

  return (
    <section
      id="services"
      aria-label="Our services"
      className={cn(
        "relative overflow-x-clip bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(5rem,12vh,9rem)] text-white",
        className,
      )}
    >
      {/* stacked label + guide line, as in the reference */}
      <div className="flex flex-col items-center">
        <p className="text-center font-footer-text text-[0.7rem] uppercase leading-[1.35] tracking-[0.2em] text-white/45">
          {content.label.map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </p>
        <span aria-hidden className="mt-4 h-[clamp(3rem,9vh,5rem)] w-px bg-gradient-to-b from-white/30 to-white/0" />
      </div>

      {/* the hovered card stays bright and the others step back (desktop only) */}
      <div
        className={cn(
          "mx-auto mt-[clamp(1.5rem,4vh,3rem)] flex w-full flex-col gap-y-[clamp(4rem,18vh,11rem)]",
          "[@media(hover:hover)_and_(pointer:fine)]:[&:has([data-svc]:hover)_[data-svc]:not(:hover)]:opacity-45",
        )}
        style={{ maxWidth: GRID_WIDTH }}
      >
        {rows.map((row, r) => (
          <PerspectiveRow key={row[0].id}>
            {row.map((card) => (
              <ServiceCard key={card.id} card={card} href={content.cta.href} priority={r === 0} />
            ))}
          </PerspectiveRow>
        ))}
      </div>

      <div className="mt-[clamp(5rem,14vh,9rem)] flex flex-col items-center gap-5 text-center">
        <p className="font-footer-display text-[clamp(1.6rem,3.2vw,2.75rem)] font-medium tracking-[-0.04em]">{content.cta.lead}</p>
        <GlassButton href={content.cta.href} variant="primary" size="lg" glowColor="violet" trailingIcon={<ArrowRightIcon className="size-4" />}>
          {content.cta.button}
        </GlassButton>
      </div>
    </section>
  );
}
