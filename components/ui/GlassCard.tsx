"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from "framer-motion";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type TagVariant = "cyan" | "violet" | "emerald" | "rose";
type MediaType  = "image" | "video";

interface GlassCardProps {
  title?:       string;
  description?: string;
  icon?:        React.ReactNode;
  tag?:         string;
  tagVariant?:  TagVariant;
  /** URL for an image or video rendered at the top of the card */
  mediaUrl?:    string;
  mediaType?:   MediaType;
  mediaAlt?:    string;
  /** Disables 3D tilt — useful for cards inside scrollable containers */
  noTilt?:      boolean;
  className?:   string;
  children?:    React.ReactNode;
}

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const SPRING: SpringOptions = { stiffness: 300, damping: 30, mass: 0.5 };
const MAX_TILT = 8;

const TAG_STYLES: Record<TagVariant, { color: string; bg: string; border: string }> = {
  cyan:    { color: "#38bdf8", bg: "rgba(56,189,248,0.10)",  border: "rgba(56,189,248,0.22)"  },
  violet:  { color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.22)" },
  emerald: { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)"  },
  rose:    { color: "#f472b6", bg: "rgba(244,114,182,0.10)", border: "rgba(244,114,182,0.22)" },
};

/* ─── GlassCard ──────────────────────────────────────────────────────────────── */

export default function GlassCard({
  title,
  description,
  icon,
  tag,
  tagVariant  = "cyan",
  mediaUrl,
  mediaType   = "image",
  mediaAlt    = "",
  noTilt      = false,
  className   = "",
  children,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), SPRING);
  const scale   = useSpring(isHovered ? 1.02 : 1, SPRING);

  const sheenX = useSpring(rawX, SPRING);
  const sheenY = useSpring(rawY, SPRING);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (noTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width  - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [noTilt, rawX, rawY]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const tagStyle    = TAG_STYLES[tagVariant];
  const hasMedia    = !!mediaUrl;
  const hasTextBody = !!(title || description || icon || tag || children);

  return (
    <div style={{ perspective: "1000px" }} className={className}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX:           noTilt ? 0 : rotateX,
          rotateY:           noTilt ? 0 : rotateY,
          scale,
          transformStyle:    "preserve-3d",
          background:        "rgba(255, 255, 255, 0.04)",
          backdropFilter:    "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          borderRadius:      "2rem",
          border:            isHovered
            ? "1px solid rgba(56, 189, 248, 0.40)"
            : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:         isHovered
            ? "0 0 24px rgba(56,189,248,0.12), 0 8px 32px rgba(0,0,0,0.45)"
            : "0 4px 24px rgba(0,0,0,0.40)",
          transition:        "border-color 0.25s ease, box-shadow 0.25s ease",
          position:          "relative",
          overflow:          "hidden",
          display:           "flex",
          flexDirection:     "column",
        }}
      >
        {/* Cursor-tracking sheen overlay */}
        {!noTilt && (
          <motion.div
            aria-hidden
            style={{
              position:      "absolute",
              inset:         0,
              borderRadius:  "inherit",
              pointerEvents: "none",
              zIndex:        10,
              opacity:       isHovered ? 1 : 0,
              transition:    "opacity 0.25s ease",
              background: useTransform(
                [sheenX, sheenY],
                ([x, y]: number[]) =>
                  `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.06) 0%, transparent 65%)`
              ),
            }}
          />
        )}

        {/* ── Media area ── */}
        {hasMedia && (
          <div
            className="relative w-full overflow-hidden flex-shrink-0"
            style={{
              borderRadius: "2rem 2rem 0 0",
              aspectRatio:  "16 / 9",
            }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "center center" }}
            >
              {mediaType === "video" ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={mediaUrl!}
                  alt={mediaAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </motion.div>
          </div>
        )}

        {/* ── Glassmorphism text overlay ── */}
        {hasTextBody && (
          <div
            className="relative z-10 flex flex-col gap-4 p-8 flex-1"
            style={hasMedia ? {
              background:         "rgba(255, 255, 255, 0.04)",
              backdropFilter:     "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderTop:          "1px solid rgba(255, 255, 255, 0.06)",
            } : undefined}
          >
            {/* Header row: icon + tag */}
            {(icon || tag) && (
              <div className="flex items-start justify-between gap-3">
                {icon && (
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{
                      background: isHovered
                        ? "rgba(56,189,248,0.15)"
                        : "rgba(255,255,255,0.06)",
                      border:     "1px solid rgba(255,255,255,0.08)",
                      color:      "#38bdf8",
                      transition: "background 0.25s ease",
                      boxShadow:  isHovered ? "0 0 12px rgba(56,189,248,0.25)" : "none",
                    }}
                  >
                    {icon}
                  </div>
                )}
                {tag && (
                  <span
                    className="text-[11px] font-semibold tracking-wide uppercase flex-shrink-0 px-2.5 py-1 rounded"
                    style={{
                      color:      tagStyle.color,
                      background: tagStyle.bg,
                      border:     `1px solid ${tagStyle.border}`,
                    }}
                  >
                    {tag}
                  </span>
                )}
              </div>
            )}

            {title && (
              <h3
                className="text-base font-bold leading-snug"
                style={{ fontFamily: '"Syne", system-ui, sans-serif', color: "#e2e8f0" }}
              >
                {title}
              </h3>
            )}

            {description && (
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#8b949e" }}>
                {description}
              </p>
            )}

            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
