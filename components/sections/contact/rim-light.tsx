import { cn } from "@/lib/utils";

/** Static ring mask: only a 1px band at the edge shows through */
const RING = {
  padding: 1,
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
} as const;

/**
 * A light that travels slowly around a rounded card's rim. The ring mask is static; inside it an
 * oversized conic gradient rotates with a CSS transform, so it runs on the compositor.
 * Brighter while anything inside the card has focus (group/rim).
 */
export function RimLight({ className, duration = 9 }: { className?: string; duration?: number }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]", className)} style={RING}>
      <span
        className="absolute left-1/2 top-1/2 aspect-square w-[160%] opacity-50 transition-opacity duration-700 group-focus-within/rim:opacity-100 motion-reduce:hidden"
        style={{
          translate: "-50% -50%",
          background: "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgb(123 97 255 / 0.9) 300deg, rgb(34 216 255 / 0.95) 335deg, transparent 360deg)",
          animation: `rim-spin ${duration}s linear infinite`,
        }}
      />
      <style>{`@keyframes rim-spin{to{transform:rotate(1turn)}}`}</style>
    </span>
  );
}
