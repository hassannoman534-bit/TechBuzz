import type { CaseStudy } from "./case-studies.config";

type CaseResultsProps = {
  results: NonNullable<CaseStudy["results"]>;
};

/**
 * The numbers, straight off the client's own dashboard, with the window named underneath so a
 * reader can tell what they are looking at. No number here is ours to round or restate.
 *
 * The list is a real <dl>: label is the term, value and change are its descriptions. DOM order is
 * term first, as the spec wants; the column is reversed with flex order so the number reads first.
 */
export function CaseResults({ results }: CaseResultsProps) {
  return (
    <section className="relative bg-[#030712] px-[clamp(1.25rem,6vw,8rem)] py-[clamp(4rem,10vh,7rem)]">
      <div className="mx-auto max-w-[min(100%,78rem)]">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/45">Results</p>

        <dl className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-2 gap-[clamp(0.75rem,1.5vw,1.25rem)] lg:grid-cols-4">
          {results.items.map((fact) => (
            <div
              key={fact.label}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-[clamp(1.1rem,2vw,1.75rem)]"
            >
              <dt className="order-2 mt-[0.45rem] text-[0.8rem] uppercase tracking-[0.14em] text-white/45">
                {fact.label}
              </dt>
              <dd className="order-1 font-footer-display text-[clamp(1.75rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
                {fact.value}
              </dd>
              {fact.delta && (
                <dd className="order-3 mt-[0.5rem] text-[0.85rem] font-medium tracking-[-0.01em] text-[#2cf5b0]">
                  {fact.delta} over the window
                </dd>
              )}
            </div>
          ))}
        </dl>

        <p className="mt-[clamp(1rem,2.5vh,1.5rem)] text-[0.85rem] leading-[1.5] text-white/40">{results.source}</p>
      </div>
    </section>
  );
}
