"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ─── CustomCursor ───────────────────────────────────────────────────────────
   Renders a precise dot + lagging ring cursor. Responds to:
     data-cursor="magnetic"  → ring scales 2.5× with cyan border
     data-cursor="text"      → dot vanishes, ring becomes a blur lens 4×
     data-cursor="explore"   → dot grows 8× with mix-blend-mode:difference
                               (inverts colors behind it — Cuberto/Exoape style)
──────────────────────────────────────────────────────────────────────────── */

type CursorMode = "default" | "magnetic" | "text" | "explore";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <CursorInner />;
}

function CursorInner() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const ringX = useSpring(dotX, springConfig);
  const ringY = useSpring(dotY, springConfig);

  const [mode, setMode] = useState<CursorMode>("default");

  useEffect(() => {
    document.body.style.cursor = "none";

    function onMouseMove(e: MouseEvent) {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
    }

    function onMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      const val = target?.dataset.cursor as CursorMode | undefined;
      setMode(val ?? "default");
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, [dotX, dotY]);

  const isExplore = mode === "explore";

  /* DOT: in explore mode, scale×8 with mix-blend-mode:difference */
  const dotScale = mode === "text" ? 0 : isExplore ? 8 : 1;
  const dotSpring = useSpring(dotScale, { stiffness: 200, damping: 28 });

  /* RING: hidden in explore mode */
  const ringScale       = mode === "magnetic" ? 2.5 : mode === "text" ? 4 : 1;
  const ringOpacity     = isExplore ? 0 : 1;
  const ringBorderColor = mode === "magnetic" ? "rgba(56,189,248,0.6)" : "rgba(255,255,255,0.4)";
  const ringBg          = mode === "text" ? "rgba(255,255,255,0.08)" : "transparent";
  const ringBlur        = mode === "text" ? "blur(4px)" : "none";

  const baseStyle: React.CSSProperties = {
    position:      "fixed",
    pointerEvents: "none",
    zIndex:        9999,
    top:           0,
    left:          0,
  };

  return (
    <>
      {/* DOT — mix-blend-mode:difference always set for seamless transition */}
      <motion.div
        style={{
          ...baseStyle,
          width:           "8px",
          height:          "8px",
          borderRadius:    "50%",
          backgroundColor: "#ffffff",
          mixBlendMode:    "difference",
          x:               dotX,
          y:               dotY,
          translateX:      "-50%",
          translateY:      "-50%",
          scale:           dotSpring,
        }}
      />

      {/* RING — spring-lagged follower, hidden during explore */}
      <motion.div
        style={{
          ...baseStyle,
          width:        "36px",
          height:       "36px",
          borderRadius: "50%",
          x:            ringX,
          y:            ringY,
          translateX:   "-50%",
          translateY:   "-50%",
        }}
        animate={{
          scale:           ringScale,
          opacity:         ringOpacity,
          borderColor:     ringBorderColor,
          backgroundColor: ringBg,
          backdropFilter:  ringBlur,
          borderWidth:     "1px",
          borderStyle:     "solid",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </>
  );
}
