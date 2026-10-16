"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  /** Cursor-tracking spotlight (mouse only). Off for reduced motion. */
  spotlight?: boolean;
};

const SPOT = 560;

/** Gradient rim: lit from the top left, violet catch light bottom right. Drawn as a 1px masked ring. */
const RIM: CSSProperties = {
  padding: 1,
  background:
    "linear-gradient(140deg, rgb(255 255 255 / 0.30), rgb(255 255 255 / 0.07) 28%, rgb(255 255 255 / 0.02) 62%, rgb(123 97 255 / 0.38))",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

/**
 * Premium glass surface: low-opacity fill, backdrop blur, gradient rim, layered inner shadows
 * (top highlight, bottom violet depth) and an optional spotlight that follows the cursor.
 * The spotlight writes CSS variables through a ref, so moving the mouse never re-renders React.
 */
export function GlassPanel({ children, className, spotlight = true }: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const spot = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  // Spotlight is its own layer moved with translate3d (compositor only), batched to one write per
  // frame. The blurred card itself is never repainted while the mouse moves.
  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!spotlight || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - SPOT / 2;
    const y = e.clientY - r.top - SPOT / 2;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (spot.current) spot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={cn(
        "group/glass relative isolate overflow-hidden rounded-[32px] backdrop-blur-md",
        "bg-[linear-gradient(180deg,rgb(255_255_255/0.05),rgb(255_255_255/0.015)_45%,rgb(255_255_255/0.01))]",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.12),inset_0_-1px_0_rgb(255_255_255/0.03),inset_0_28px_56px_-28px_rgb(255_255_255/0.06),inset_0_-60px_90px_-50px_rgb(123_97_255/0.16),0_50px_120px_-50px_rgb(0_0_0/0.95)]",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={RIM} />
      {/* top sheen line */}
      <span aria-hidden className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      {spotlight && (
        <span
          ref={spot}
          aria-hidden
          style={{ width: SPOT, height: SPOT, transform: `translate3d(50%, -${SPOT / 2}px, 0)` }}
          className="pointer-events-none absolute left-0 top-0 -z-10 rounded-full opacity-0 bg-[radial-gradient(circle,rgb(123_97_255/0.14),rgb(34_216_255/0.045)_40%,transparent_70%)] [transition:opacity_600ms_cubic-bezier(0.22,1,0.36,1),transform_450ms_cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/glass:opacity-100"
        />
      )}
      {children}
    </div>
  );
}
