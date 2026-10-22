"use client";

import Link from "next/link";
import { memo, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClientLogo } from "./client-logo";
import type { ClientLogo as ClientLogoData } from "./client-wall.config";

type ClientTileProps = {
  slot: number;
  client: ClientLogoData;
  /** Smoothed scroll progress of the section (0 entering at the bottom, 1 gone at the top) */
  progress: MotionValue<number>;
  /** 0 for the tiles at the centre of the wall, 1 for the corners: sets the order of the 3D assembly */
  distance: number;
  /** Scroll-driven 3D in and out (off for reduced motion) */
  animated: boolean;
  /** Desktop hover effects (tilt, lift, blend cursor) */
  hoverMode: boolean;
  /** Another tile is hovered: fade this one back */
  dimmed: boolean;
  onHover: (slot: number | null) => void;
};

const EASE = [0.65, 0, 0.35, 1] as const;
const TILT = { stiffness: 160, damping: 18, mass: 0.6 };
const MAX_TILT = 12;

/** One face of the flipping plate: glass tile with the logo centred. */
function Face({ children, back, dimmed }: { children: ReactNode; back?: boolean; dimmed: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center rounded-[inherit] [backface-visibility:hidden]",
        "bg-[linear-gradient(160deg,rgb(255_255_255/0.055),rgb(255_255_255/0.012)_55%,rgb(123_97_255/0.03))]",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.10),inset_0_0_0_1px_rgb(255_255_255/0.07)]",
      )}
      style={back ? { transform: "rotateX(180deg)" } : undefined}
    >
      {/* opacity lives on this leaf, never on a 3D parent (opacity would flatten the 3D) */}
      <div aria-hidden className={cn("grid size-full place-items-center transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", dimmed ? "opacity-25" : "opacity-100")}>
        {children}
      </div>
    </div>
  );
}

/**
 * A logo tile on the wall.
 * - Scroll: flies in from depth (rotateX + translateZ), centre tiles first, and tilts away on exit.
 * - Swap: when its client changes, the plate rolls over (rotateX 180) to the new logo on the back face.
 * - Hover: tilts toward the pointer and lifts off the wall. Pointer moves only write motion values.
 */
function ClientTileBase({ slot, client, progress, distance, animated, hoverMode, dimmed, onHover }: ClientTileProps) {
  // ---- scroll in / out (shared progress, a staggered window per tile)
  const a = 0.04 + distance * 0.1;
  const b = a + 0.26;
  const c = 0.7 + (1 - distance) * 0.06;
  const d = Math.min(1, c + 0.24);
  const enterRotate = useTransform(progress, [a, b, c, d], [-72, 0, 0, 48]);
  const enterZ = useTransform(progress, [a, b, c, d], [-460, 0, 0, -320]);
  const enterY = useTransform(progress, [a, b, c, d], [90, 0, 0, -50]);
  const enterOpacity = useTransform(progress, [a, a + (b - a) * 0.55, c + (d - c) * 0.35, d], [0, 1, 1, 0]);

  // ---- flip between faces when the client changes
  const [faces, setFaces] = useState<[ClientLogoData, ClientLogoData]>([client, client]);
  const [flips, setFlips] = useState(0);
  const flipCount = useRef(0);
  const shown = useRef(client);
  useEffect(() => {
    if (client === shown.current) return;
    shown.current = client;
    if (!animated) {
      setFaces([client, client]);
      return;
    }
    // put the new logo on the hidden face and roll over to it (one render, both updates batched)
    const next = flipCount.current + 1;
    flipCount.current = next;
    setFaces((f) => (next % 2 === 0 ? [client, f[1]] : [f[0], client]));
    setFlips(next);
  }, [client, animated]);

  // ---- hover tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const lift = useMotionValue(0);
  const tiltX = useSpring(rx, TILT);
  const tiltY = useSpring(ry, TILT);
  const tiltZ = useSpring(lift, TILT);

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!hoverMode) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rx.set(-py * MAX_TILT);
    ry.set(px * MAX_TILT * 1.25);
  };
  const onEnter = (): void => {
    if (!hoverMode) return;
    lift.set(46);
    onHover(slot);
  };
  const onLeave = (): void => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
    onHover(null);
  };

  const current = faces[flips % 2];
  const plate = (
    <motion.div
      className="absolute inset-0 rounded-[inherit] [transform-style:preserve-3d]"
      initial={false}
      animate={{ rotateX: flips * 180 }}
      transition={{ duration: 1.15, ease: EASE }}
    >
      <Face dimmed={dimmed}>
        <ClientLogo client={faces[0]} />
      </Face>
      <Face back dimmed={dimmed}>
        <ClientLogo client={faces[1]} />
      </Face>
    </motion.div>
  );

  return (
    <motion.li
      className="[transform-style:preserve-3d]"
      style={animated ? { rotateX: enterRotate, z: enterZ, y: enterY, opacity: enterOpacity, willChange: "transform, opacity" } : undefined}
    >
      <motion.div
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: tiltX, rotateY: tiltY, z: tiltZ }}
        className="group/tile relative aspect-[16/10] rounded-[clamp(14px,1.6vw,22px)] [transform-style:preserve-3d]"
      >
        {/* hover glow: a violet rim and soft light under the lifted tile */}
        {hoverMode && (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 shadow-[0_0_0_1px_rgb(123_97_255/0.45),0_30px_70px_-25px_rgb(123_97_255/0.55)] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:opacity-100"
          />
        )}
        {current.href ? (
          <Link href={current.href} aria-label={`${current.name} case study`} className="absolute inset-0 rounded-[inherit] outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-[#7b61ff]">
            {plate}
          </Link>
        ) : (
          <div role="img" aria-label={current.name} className="absolute inset-0 rounded-[inherit] [transform-style:preserve-3d]">
            {plate}
          </div>
        )}
      </motion.div>
    </motion.li>
  );
}

export const ClientTile = memo(ClientTileBase);
