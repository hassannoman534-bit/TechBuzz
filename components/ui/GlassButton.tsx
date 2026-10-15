"use client";

import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────────────── */
export type GlassButtonVariant = "primary" | "secondary" | "outline" | "glow";
export type GlassButtonSize = "sm" | "md" | "lg";
export type GlassGlowColor = "cyan" | "violet" | "blue" | "emerald";

type CommonProps = {
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  /** Accent used for tint, border, focus ring and hover glow */
  glowColor?: GlassGlowColor;
  /** Optional icon before / after the label */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type MotionLinkProps = Omit<ComponentProps<typeof MotionLink>, keyof CommonProps | "href">;
type MotionButtonProps = Omit<HTMLMotionProps<"button">, keyof CommonProps | "children">;

export type GlassButtonProps =
  | (CommonProps & MotionLinkProps & { href: string })
  | (CommonProps & MotionButtonProps & { href?: undefined });

/* ── Tokens ────────────────────────────────────────────────────────────────── */
/** RGB triplets — consumed as rgb(var(--glow) / alpha), so one class set serves every colour. */
const GLOW_RGB: Record<GlassGlowColor, string> = {
  cyan: "34 216 255", // Ion
  violet: "123 97 255", // Nebula
  blue: "91 124 255",
  emerald: "44 245 176", // Aurora
};

const SIZE: Record<GlassButtonSize, string> = {
  sm: "h-9 px-4 gap-1.5 text-[0.8125rem]",
  md: "h-11 px-6 gap-2 text-[0.9375rem]",
  lg: "h-14 px-8 gap-2.5 text-[1.0625rem]",
};

const VARIANT: Record<GlassButtonVariant, string> = {
  primary: cn(
    "border-[rgb(var(--glow)/0.32)] bg-[rgb(var(--glow)/0.11)]",
    "hover:border-[rgb(var(--glow)/0.62)] hover:bg-[rgb(var(--glow)/0.2)]",
    "shadow-[0_8px_32px_rgb(0_0_0/0.37)]",
  ),
  secondary: cn(
    "border-white/20 bg-white/10",
    "hover:border-white/30 hover:bg-white/[0.15]",
    "shadow-[0_8px_32px_rgb(0_0_0/0.37)]",
  ),
  outline: cn(
    "border-white/15 bg-white/[0.02]",
    "hover:border-[rgb(var(--glow)/0.5)] hover:bg-white/[0.05]",
  ),
  glow: cn(
    "border-[rgb(var(--glow)/0.45)] bg-[linear-gradient(135deg,rgb(var(--glow)/0.3),rgb(123_97_255/0.22))]",
    "hover:border-[rgb(var(--glow)/0.8)]",
    "shadow-[0_10px_40px_-8px_rgb(var(--glow)/0.55),0_8px_32px_rgb(0_0_0/0.37)]",
    "hover:shadow-[0_14px_52px_-6px_rgb(var(--glow)/0.75),0_8px_32px_rgb(0_0_0/0.37)]",
  ),
};

const BASE = cn(
  "group relative isolate inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full border",
  "font-semibold leading-none tracking-[-0.01em] text-white select-none",
  // PERF: capped from backdrop-blur-xl (24px) to 14px — 16px limit per perf audit
  "backdrop-blur-[14px] backdrop-saturate-150",
  "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
  "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--glow)/0.75)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712]",
  "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
);

/** 1px rim lit from above (Apple-style edge reflection) — a masked gradient, so it is a true border, not a wash. */
const RIM_STYLE: CSSProperties = {
  padding: 1,
  background: "linear-gradient(180deg, rgb(255 255 255 / 0.5), rgb(255 255 255 / 0.08) 45%, rgb(255 255 255 / 0) 70%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
};

const SPRING = { type: "spring", stiffness: 400, damping: 25 } as const;

const MotionLink = motion.create(Link);

/* ── Component ─────────────────────────────────────────────────────────────── */
export function GlassButton(props: GlassButtonProps) {
  const {
    variant = "primary",
    size = "md",
    glowColor = "cyan",
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    children,
    className,
    style,
    ...rest
  } = props;

  const reduceMotion = useReducedMotion();
  const isDisabled = "disabled" in rest && Boolean(rest.disabled);
  const interactive = !reduceMotion && !isDisabled;

  const classes = cn(BASE, SIZE[size], VARIANT[variant], fullWidth && "w-full", className);
  const mergedStyle = { ["--glow" as string]: GLOW_RGB[glowColor], ...style } as CSSProperties;
  // Always pass whileHover/whileTap (empty when reduced/disabled): Framer adds tabindex when they exist,
  // so keeping them present on server AND client prevents a hydration mismatch for reduced-motion users.
  const motionProps = {
    whileHover: interactive ? { scale: 1.03, y: -2 } : {},
    whileTap: interactive ? { scale: 0.97 } : {},
    transition: SPRING,
  };

  const inner = (
    <>
      {/* Hover glow from below — gradient only (no blur filter), so it's free to animate */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_140%_at_50%_125%,rgb(var(--glow)/0.5),transparent_62%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {/* Liquid lens: soft highlight across the top half */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 rounded-t-full bg-[linear-gradient(180deg,rgb(255_255_255/0.14),transparent)]" />
      {/* Edge reflection */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={RIM_STYLE} />

      {leadingIcon && <span className="relative inline-flex shrink-0">{leadingIcon}</span>}
      <span className="relative">{children}</span>
      {trailingIcon && (
        <span className="relative inline-flex shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5">
          {trailingIcon}
        </span>
      )}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...linkRest } = rest as MotionLinkProps & { href: string };
    return (
      <MotionLink href={href} className={classes} style={{ ...mergedStyle, willChange: "transform", backfaceVisibility: "hidden" }} {...motionProps} {...linkRest}>
        {inner}
      </MotionLink>
    );
  }

  const { type = "button", ...buttonRest } = rest as MotionButtonProps;
  return (
    <motion.button type={type} className={classes} style={{ ...mergedStyle, willChange: "transform", backfaceVisibility: "hidden" }} {...motionProps} {...buttonRest}>
      {inner}
    </motion.button>
  );
}

export default GlassButton;
