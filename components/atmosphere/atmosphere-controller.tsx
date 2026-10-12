"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AtmosphereController(): null {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const sections = document.querySelectorAll<HTMLElement>("[data-atmo]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const scene = (entry.target as HTMLElement).dataset.atmo;
          if (scene) root.dataset.atmo = scene;
        }
      },
      { rootMargin: "-45% 0px -45% 0px" } // fires when a section crosses the viewport's centre band
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
