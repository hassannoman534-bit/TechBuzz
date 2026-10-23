"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

// three.js only loads in the browser, after the page is interactive (keeps it out of the first paint).
const SphereScene = dynamic(() => import("./sphere-scene"), { ssr: false });

type HeroSphereProps = {
  /** Base opacity of the sphere layer (low, so text stays the hero) */
  opacity?: number;
  /** Sphere diameter as a share of the shorter screen side */
  fill?: number;
  className?: string;
};

/**
 * 3D geodesic sphere that sits behind everything in the home hero.
 * Put it as the first child of the hero section (the section needs `relative isolate overflow-hidden`).
 * It spins slowly all the time, reacts to scrolling (spins with the scroll direction, rises, grows and
 * fades as the hero leaves), and tilts gently toward the mouse. The render loop stops while the hero
 * is off screen; with reduced motion it is a single still frame.
 */
export function HeroSphere({ opacity = 0.2, fill = 0.72, className }: HeroSphereProps) {
  const reduce = useReducedMotionSafe();
  const layer = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={layer}
      aria-hidden
      // starts invisible; the scene drives opacity per frame (reduced motion: fixed opacity)
      style={{ opacity: reduce && ready ? opacity * 0.85 : 0 }}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        // soft fade at the bottom so the sphere melts into the next section
        "[mask-image:linear-gradient(to_bottom,#000_0%,#000_72%,transparent_100%)]",
        className,
      )}
    >
      <SphereScene active={visible} still={reduce} fill={fill} opacity={opacity} layerRef={layer} onReady={() => setReady(true)} />
    </div>
  );
}
