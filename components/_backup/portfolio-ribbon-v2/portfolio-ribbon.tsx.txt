"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useScroll } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { RIBBON } from "./portfolio-ribbon.config";

/**
 * The work ribbon: client screenshots bent around a helix, rising through a
 * pinned stage and spinning past as the page scrolls.
 *
 * Ported from a 21st.dev component (kedhareswer/helix-ribbon-hero) and cut down
 * to the ribbon. See portfolio-ribbon.config.ts for the geometry.
 *
 * ── What was changed from the original, and why ─────────────────────────────
 *
 *  1. Everything but the ribbon is gone: the headline, the per letter intro,
 *     the portrait, the nav, the bio, the count and the closing grid. This page
 *     already has a hero, a work list, a folio showcase and a client wall, and
 *     the ask was the flying images and nothing else.
 *
 *  2. The Google Fonts <link> the original injects is gone with the headline.
 *     It would have broken the build regardless: Turbopack's font handling
 *     reaches fonts.googleapis.com during the build, which is exactly the
 *     failure every face on this site was self hosted to avoid.
 *
 *  3. Scroll comes from framer-motion's useScroll rather than a
 *     getBoundingClientRect on every frame. The original measures the section's
 *     position each tick, which forces a layout immediately before the loop
 *     writes 64 transforms: the one thing this project's frame loops are not
 *     allowed to do. A motion value is read with no layout at all.
 *
 *  4. The autoplay loop and its wheel, touch, keydown and scroll listeners are
 *     gone. They existed to demo the component unattended on a registry page,
 *     and listening on wheel and touch is a standing rule here.
 *
 *  5. Reduced motion gets the work as a plain grid rather than a hidden
 *     ribbon. Upstream simply stops drawing, which on a section whose entire
 *     content is the ribbon would leave an empty hole.
 *
 * Nothing here paints to a canvas, so it costs no WebGL context. That matters
 * on this site: the CEO page is already at the browser's budget.
 */

const px = (v: number): string => `${v.toFixed(2)}px`;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 0 below a, 1 above b, linear between. */
const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));
const easeSine = (t: number): number => 0.5 - 0.5 * Math.cos(Math.PI * t);

/**
 * Structural CSS only. These are the rules that cannot be expressed as utility
 * classes without risk: this project has had arbitrary Tailwind values dropped
 * from a build before, and a missing `transform-style` would silently flatten
 * the whole helix into a stack of overlapping rectangles.
 */
const CSS = [
  ".pr-view{position:absolute;inset:0;perspective-origin:50% 50%}",
  ".pr-scene{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}",
  ".pr-group,.pr-screw{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}",
  ".pr-slice{position:absolute;left:0;top:0;transform-origin:0 0;background-repeat:no-repeat;backface-visibility:hidden}",
].join("\n");

export function PortfolioRibbon(): React.ReactElement | null {
  const reduce = useReducedMotionSafe();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const screwRef = useRef<HTMLDivElement>(null);

  /** 0 when the stage pins, 1 when it lets go. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const work = RIBBON.work;
  const S = RIBBON.slices;

  useEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    const view = viewRef.current;
    const group = groupRef.current;
    const screw = screwRef.current;
    if (!stage || !view || !group || !screw) return;

    const slices = Array.from(screw.children) as HTMLDivElement[];
    const n = work.length;

    const L = { W: 0, H: 0, R: 0, ch: 0, pitch: 0, dTheta: 0, persp: 0 };

    /*
      Layout. Run on mount and on resize, never per frame.

      R falls out of the card width and the cards per turn, because a turn must
      come back round in exactly `perTurn` cards. Each strip is then skewed by
      the angle between its own width and how far it descends across that
      width, which is what makes neighbouring strips meet flush instead of
      stepping.
    */
    const layout = (): void => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (!W || !H) return;
      L.W = W;
      L.H = H;

      const U = Math.max(Math.min(W, H * 1.6), H * 0.62);
      const cw = U * 0.4;
      L.ch = cw / 1.5;
      L.dTheta = (Math.PI * 2) / RIBBON.perTurn;
      L.R = cw / L.dTheta;
      L.pitch = L.ch * RIBBON.pitch;
      L.persp = U * 1.05;
      view.style.perspective = px(L.persp);

      const sw = 2 * L.R * Math.sin(L.dTheta / S / 2);
      const dy = (L.pitch * (L.dTheta / S)) / (Math.PI * 2);
      const skew = (Math.atan2(dy, sw) * 180) / Math.PI;

      for (let k = 0; k < slices.length; k++) {
        const back = k % 2;
        const i = Math.floor(k / (2 * S));
        const j = Math.floor(k / 2) % S;
        const a = i * L.dTheta + (j + 0.5) * (L.dTheta / S);
        const y = -(L.pitch * a) / (Math.PI * 2);
        const el = slices[k];
        // A pixel of overlap each side hides the antialiasing hairline that
        // would otherwise show at every seam.
        el.style.width = px(sw + 2);
        el.style.height = px(L.ch);
        el.style.backgroundSize = `${px(sw * S)} ${px(L.ch)}`;
        el.style.backgroundPosition = `${px(1 - (back ? S - 1 - j : j) * sw)} 0px`;
        // The back face is turned round and shows the mirrored strip, so the
        // ribbon never shows reversed screenshots as it spins.
        el.style.transform =
          `rotateY(${((a * 180) / Math.PI).toFixed(3)}deg) ` +
          `translate3d(${px(-sw / 2 - 1)},${px(y - L.ch / 2 + dy / 2)},${px(L.R)}) ` +
          `skewY(${(-skew).toFixed(3)}deg)` +
          (back ? ` translateX(${px(sw + 2)}) rotateY(180deg)` : "");
      }
      draw(true);
    };

    let cur = 0;
    const shade = new Float32Array(slices.length).fill(-1);

    const draw = (force?: boolean): void => {
      const { W, H } = L;
      if (!W) return;

      const t = seg(cur, RIBBON.phase[0], RIBBON.phase[1]);
      if (t <= 0 || t >= 1) {
        group.style.visibility = "hidden";
        return;
      }
      group.style.visibility = "visible";

      // Rise eases in and then runs linear, so the ribbon arrives softly and
      // leaves at a steady rate rather than decelerating out of frame.
      const rise01 = easeSine(t) * 0.35 + t * 0.65;
      const phi = -0.85 * Math.PI + t * 2.1 * Math.PI;

      const span = (L.pitch * ((n - 1) * L.dTheta)) / (Math.PI * 2);
      const reach = H / 2 + span / 2 + L.ch * 1.6;
      const rise = reach - rise01 * 2 * reach;
      const screwY = -(L.pitch * phi) / (Math.PI * 2);
      const centre = -span / 2 + screwY;

      group.style.transform =
        `translate3d(${px(-W * 0.04)},${px(rise - centre)},${px(-L.R)}) ` +
        `rotateZ(${RIBBON.tiltZ}deg) rotateX(${RIBBON.tiltX}deg)`;
      screw.style.transform = `rotateY(${((phi * 180) / Math.PI).toFixed(3)}deg) translateY(${px(screwY)})`;

      // Shading is what reads as form. Writing a filter on 64 layers every
      // frame is not free, so each one is only touched when it has actually
      // moved enough to see.
      const floor = RIBBON.shadeFloor;
      const range = 1 - floor;
      for (let k = 0; k < slices.length; k++) {
        const i = Math.floor(k / (2 * S));
        const j = Math.floor(k / 2) % S;
        const a = i * L.dTheta + (j + 0.5) * (L.dTheta / S) + phi;
        const c = k % 2 ? -Math.cos(a) : Math.cos(a);
        if (c < -0.05) continue;
        const b = floor + range * Math.max(0, c);
        if (force || Math.abs(b - shade[k]) > 0.015) {
          shade[k] = b;
          slices[k].style.filter = `brightness(${b.toFixed(3)})`;
        }
      }
    };

    let raf = 0;
    let last = performance.now();
    let visible = false;

    const tick = (now: number): void => {
      const dt = Math.min(64, now - last);
      last = now;
      const goal = clamp01(scrollYProgress.get());
      // Light smoothing on top of Lenis. See RIBBON.easeMs.
      cur += (goal - cur) * (1 - Math.exp(-dt / RIBBON.easeMs));
      if (Math.abs(goal - cur) < 0.00005) cur = goal;
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    // The loop sleeps whenever the section is off screen, so a ribbon four
    // screens further down costs nothing while someone reads the hero.
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(stage);

    const ro = new ResizeObserver(() => layout());
    ro.observe(stage);

    layout();
    cur = clamp01(scrollYProgress.get());
    draw(true);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [S, reduce, scrollYProgress, work]);

  if (!RIBBON.enabled) return null;

  /*
    Reduced motion gets the same work as a still grid. The ribbon is this
    section's only content, so the upstream behaviour of simply not drawing it
    would leave four screens of empty page.
  */
  if (reduce) {
    return (
      <section className="relative z-0 w-full bg-[#030712] px-[clamp(1.25rem,5vw,5.5rem)] py-[clamp(3rem,8vh,6rem)]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((item) => (
            <div
              key={item.src}
              className="relative aspect-[3/2] overflow-hidden rounded-lg border border-white/10"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      /*
        No overflow-hidden here. This is the pin's scroll ancestor, and hiding
        overflow on it turns it into its own scroll box and the stage below
        stops sticking. The same rule the other pinned stages on this site
        follow: the clipping belongs on the stage.
      */
      className="relative z-0 w-full bg-[#030712]"
      style={{ height: `calc(100svh * ${RIBBON.screens + 1})` }}
      aria-label="Selected client work"
    >
      <div
        ref={stageRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100svh" }}
      >
        <style>{CSS}</style>
        {/*
          The ribbon is motion, not content: every screenshot on it is already
          listed as real text and real images by the work list and the folio
          showcase on this page, so announcing 64 strips would only repeat them.
        */}
        <div ref={viewRef} className="pr-view" aria-hidden>
          <div className="pr-scene">
            <div ref={groupRef} className="pr-group" style={{ visibility: "hidden" }}>
              <div ref={screwRef} className="pr-screw">
                {work.flatMap((item, i) =>
                  Array.from({ length: S * 2 }, (_, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="pr-slice"
                      style={{ backgroundImage: `url(${JSON.stringify(item.src)})` }}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
