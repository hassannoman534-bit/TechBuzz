import { cn } from "@/lib/utils";

type RollTextProps = {
  children: string;
  className?: string;
  /** Tailwind group name that triggers the roll, e.g. "row" for group/row */
  group?: "row" | "card";
};

/**
 * Hover roll: two stacked copies inside a mask. On hover of the parent group the visible copy
 * slides up and out while the second rises in, letter by letter. CSS transforms only.
 */
export function RollText({ children, className, group = "row" }: RollTextProps) {
  const letters = Array.from(children);
  const hover = group === "row" ? "group-hover/row:-translate-y-full" : "group-hover/card:-translate-y-full";

  return (
    <span className={cn("relative inline-flex overflow-hidden whitespace-nowrap", className)}>
      <span className="sr-only">{children}</span>
      {letters.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "relative inline-block transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            hover,
          )}
          style={{ transitionDelay: `${i * 14}ms` }}
        >
          <span className="block">{ch === " " ? " " : ch}</span>
          <span className="absolute left-0 top-full block">{ch === " " ? " " : ch}</span>
        </span>
      ))}
    </span>
  );
}
