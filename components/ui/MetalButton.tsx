"use client";

import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { MetalFx, type MetalFxPreset } from "metal-fx";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

export type MetalButtonPreset = MetalFxPreset; // "chromatic" | "silver" | "gold"
export type MetalButtonVariant = "button" | "circle";
export type MetalButtonSize = "sm" | "md" | "lg";

type MetalCommonProps = {
  /** Colour palette of the metal ring. */
  preset?: MetalButtonPreset;
  /** "button" = pill shape, "circle" = compact round ring (icon buttons). */
  variant?: MetalButtonVariant;
  size?: MetalButtonSize;
  /** The site is dark, so dark by default. "auto" follows the OS setting. */
  theme?: "auto" | "dark" | "light";
  /** Ring intensity at rest (0 to 1). It rises to full on hover. */
  strength?: number;
  /** Freeze the shader on its current frame. Also forced on for reduced motion. */
  paused?: boolean;
  /** Turn off the wandering glow around the ring (the metal ring itself stays). */
  disableGlow?: boolean;
  /** Fill of the button face. Defaults to the TechBuzz deep indigo. Any CSS background. */
  surface?: string;
  className?: string;
  children: ReactNode;
};

type MetalAsButton = MetalCommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MetalCommonProps> & { href?: undefined };
type MetalAsLink = MetalCommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof MetalCommonProps | "href"> & { href: string };

export type MetalButtonProps = MetalAsButton | MetalAsLink;

/** Deep indigo face that sits in the site palette (#030712 page, #7b61ff violet, #22d8ff ion). */
const BRAND_SURFACE = "linear-gradient(180deg, #1c1850 0%, #12103a 55%, #0b0a26 100%)";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const BASE = cn(
  "group/metal relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-medium text-white outline-none",
  "focus-visible:ring-2 focus-visible:ring-[#7b61ff]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712]",
  "disabled:pointer-events-none disabled:opacity-50",
);

const PILL: Record<MetalButtonSize, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const ROUND: Record<MetalButtonSize, string> = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-14 text-base",
};

/** Hover layers inside the face: a brand gradient that rises from the bottom, and a label that rolls. */
function Face({ children }: { children: ReactNode }) {
  return (
    <>
      {/* rising fill, inset 3px so the metal ring stays visible around it */}
      <span aria-hidden className="pointer-events-none absolute inset-[3px] -z-10 overflow-hidden rounded-[inherit]">
        <span
          className={cn(
            "absolute inset-x-[-12%] top-full aspect-square rounded-[42%]",
            "bg-[linear-gradient(140deg,#7b61ff_0%,#5b7cff_55%,#22a8ff_100%)]",
            "transition-transform duration-700",
            EASE,
            "group-hover/metal:-translate-y-[58%] group-focus-visible/metal:-translate-y-[58%]",
          )}
        />
      </span>
      {/* top sheen that brightens on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/[0.08] to-transparent transition-opacity duration-500 group-hover/metal:opacity-0"
      />
      {/* rolling label: the copy below slides up into place */}
      <span className="relative inline-flex overflow-hidden">
        <span className={cn("inline-flex items-center gap-2 transition-transform duration-500", EASE, "group-hover/metal:-translate-y-full group-focus-visible/metal:-translate-y-full")}>
          {children}
        </span>
        <span
          aria-hidden
          className={cn("absolute inset-0 inline-flex translate-y-full items-center justify-center gap-2 transition-transform duration-500", EASE, "group-hover/metal:translate-y-0 group-focus-visible/metal:translate-y-0")}
        >
          {children}
        </span>
      </span>
    </>
  );
}

/**
 * A button (or link, when `href` is set) wrapped in an animated WebGL "liquid metal" ring
 * from metal-fx, themed for TechBuzz: deep indigo face, brand gradient fill rising on hover,
 * rolling label, gentle lift, and the metal ring brightening while hovered.
 * The effect is painted on top of the element and never blocks clicks.
 */
export const MetalButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, MetalButtonProps>(function MetalButton(
  {
    preset = "chromatic",
    variant = "button",
    size = "md",
    theme = "dark",
    strength = 0.8,
    paused = false,
    disableGlow = false,
    surface = BRAND_SURFACE,
    className,
    children,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotionSafe();
  // metal-fx renders different markup on the server and in the browser (React hydration
  // error #418), so the plain button is server-rendered and the metal effect is added
  // right after mount. The effect is purely visual, so nothing is lost.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [hovered, setHovered] = useState(false);

  const classes = cn(BASE, variant === "circle" ? ROUND[size] : PILL[size], className);
  const content = variant === "circle" ? children : <Face>{children}</Face>;
  const hoverHandlers = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  };
  // Before mount the button paints its own face; after mount metal-fx makes the button
  // transparent and the same face is painted on its wrapper instead.
  const faceStyle = { background: surface };

  const host =
    "href" in rest && typeof rest.href === "string" ? (
      (() => {
        const { href, ...anchorProps } = rest as MetalAsLink;
        return (
          <Link ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} style={faceStyle} {...hoverHandlers} {...anchorProps}>
            {content}
          </Link>
        );
      })()
    ) : (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={(rest as MetalAsButton).type ?? "button"}
        className={classes}
        style={faceStyle}
        {...hoverHandlers}
        {...(rest as Omit<MetalAsButton, keyof MetalCommonProps>)}
      >
        {content}
      </button>
    );

  if (!mounted) return host;

  return (
    <MetalFx
      variant={variant}
      preset={preset}
      theme={theme}
      strength={hovered ? 1 : strength}
      paused={paused || reduce}
      disableGlow={disableGlow}
      // metal-fx paints #272727 on this wrapper; an inline style is the documented override.
      style={{ background: surface }}
      className={cn("rounded-full transition-transform duration-500", EASE, !reduce && "hover:-translate-y-0.5 hover:scale-[1.03]")}
    >
      {host}
    </MetalFx>
  );
});

export default MetalButton;
export { MetalFx };
