"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getDisplacementFilter } from "@/lib/liquidGlass";

/* ─── LiquidGlassCard ────────────────────────────────────────────────────────
   Apple iOS 26 liquid-glass refraction effect.
   Uses a dynamically generated SVG feDisplacementMap applied via
   backdrop-filter: url(data:...) so the content behind the card bends
   at the edges — producing the authentic iOS glass look.

   Falls back to standard blur()+saturate() on browsers that don't support
   backdrop-filter: url(...) (Firefox, some mobile WebKit).

   Props:
     depth              — how far the edge refraction reaches (px). default 10
     strength           — displacement intensity. default 80
     chromaticAberration — RGB split at edges. default 0
     blur               — extra Gaussian blur on top. default 0
     radius             — border-radius in px. default 20
     className          — extra classes on the wrapper
     style              — extra inline styles on the wrapper
     children
──────────────────────────────────────────────────────────────────────────── */

interface LiquidGlassCardProps {
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  radius?: number;
  saturate?: number;
  brightness?: number;
  overlayColor?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/* detect backdrop-filter: url() support once */
const supportsFilterUrl =
  typeof window !== "undefined" &&
  (() => {
    const el = document.createElement("div");
    el.style.cssText = "backdrop-filter: url(#t)";
    return (
      el.style.backdropFilter === "url(#t)" ||
      el.style.backdropFilter === 'url("#t")'
    );
  })();

export default function LiquidGlassCard({
  depth = 10,
  strength = 80,
  chromaticAberration = 0,
  blur = 0,
  radius = 20,
  saturate = 1.5,
  brightness = 1.1,
  overlayColor = "rgba(0,0,0,0.25)",
  className = "",
  style,
  children,
}: LiquidGlassCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterLayerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const applyFilter = useCallback(() => {
    const wrapper = wrapperRef.current;
    const filterLayer = filterLayerRef.current;
    if (!wrapper || !filterLayer) return;

    const rect = wrapper.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === 0 || h === 0) return;

    filterLayer.style.width = `${w}px`;
    filterLayer.style.height = `${h}px`;

    if (supportsFilterUrl) {
      const filterUri = getDisplacementFilter({
        height: h,
        width: w,
        radius,
        depth,
        strength,
        chromaticAberration,
      });
      const parts = [
        blur > 0 ? `blur(${blur / 2}px)` : "",
        `url('${filterUri}')`,
        blur > 0 ? `blur(${blur}px)` : "",
        `brightness(${brightness})`,
        `saturate(${saturate})`,
      ]
        .filter(Boolean)
        .join(" ");

      filterLayer.style.backdropFilter = parts;
      (filterLayer.style as CSSStyleDeclaration & { WebkitBackdropFilter: string }).WebkitBackdropFilter = parts;
    } else {
      /* Fallback: standard glass blur */
      const fallback = `blur(${Math.max(blur, w / 10)}px) saturate(180%)`;
      filterLayer.style.backdropFilter = fallback;
      (filterLayer.style as CSSStyleDeclaration & { WebkitBackdropFilter: string }).WebkitBackdropFilter = fallback;
    }

    setReady(true);
  }, [blur, brightness, chromaticAberration, depth, radius, saturate, strength]);

  useEffect(() => {
    applyFilter();
    const ro = new ResizeObserver(applyFilter);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [applyFilter]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: `${radius}px`,
        ...style,
      }}
    >
      {/* Tinted overlay — gives the glass its colour tint */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: overlayColor,
          borderRadius: `${radius}px`,
        }}
      />

      {/* Displacement / refraction layer */}
      <div
        ref={filterLayerRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          borderRadius: `${radius}px`,
          /* inset highlight — the line that makes it feel like real glass */
          boxShadow: "inset 0 0 4px 0 rgba(250,250,250,0.5)",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3 }}>
        {children}
      </div>
    </div>
  );
}
