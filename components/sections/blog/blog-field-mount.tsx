"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/**
 * three and the scene are ~150 KB gzipped, so they are not in the page bundle.
 * The import only starts once the masthead is actually on screen, which keeps
 * them off the critical path for a reader who lands deep in the archive.
 */
const BlogField = dynamic(() => import("./blog-field"), { ssr: false });

/**
 * Decides whether the 3D field runs at all, and keeps it paused when it is not
 * visible. Renders a CSS gradient underneath either way, so the masthead has
 * depth before WebGL loads and keeps it if WebGL never arrives.
 */
export function BlogFieldMount() {
  const reduce = useReducedMotionSafe();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Static depth. Present before the canvas mounts, and the whole
          treatment on a machine without WebGL. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 78% at 50% 8%, rgba(91,124,255,0.16) 0%, rgba(123,97,255,0.09) 34%, rgba(3,7,18,0) 72%)",
        }}
      />

      {seen ? (
        <div className="absolute inset-0 [mask-image:radial-gradient(130%_88%_at_50%_26%,#000_38%,transparent_82%)]">
          <BlogField active={visible} still={reduce} />
        </div>
      ) : null}

      {/* Keeps the type legible over whatever the field is doing behind it. */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(to top, #030712 6%, rgba(3,7,18,0) 100%)",
        }}
      />
    </div>
  );
}
