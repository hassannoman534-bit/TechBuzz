import Link from "next/link";
import { cn } from "@/lib/utils";

type RollLinkProps = {
  href: string;
  children: string;
  external?: boolean;
  className?: string;
};

/**
 * Rejouice-style link: on hover the label rolls up and an identical copy rolls in from below.
 * Pure CSS (transform only), so it costs nothing at runtime.
 */
export function RollLink({ href, children, external, className }: RollLinkProps) {
  const label = (
    <span className="relative inline-flex overflow-hidden align-top">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-x-0 top-full block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"
      >
        {children}
      </span>
    </span>
  );

  const classes = cn("group inline-block py-0.5 outline-none focus-visible:ring-1 focus-visible:ring-ion/60", className);

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {label}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
