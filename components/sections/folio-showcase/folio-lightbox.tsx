"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import type { FolioImage } from "./folio-library";

type FolioLightboxProps = {
  images: FolioImage[];
  /** Open image index, or null when closed */
  index: number | null;
  title: string;
  onChange: (index: number | null) => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full screen viewer for one folio. Esc closes, arrow keys browse; page scroll is paused while open. */
export function FolioLightbox({ images, index, title, onChange }: FolioLightboxProps) {
  const lenis = useLenis();
  const open = index !== null;
  const count = images.length;

  const step = useCallback(
    (d: number) => {
      if (index === null) return;
      onChange((index + d + count) % count);
    },
    [index, count, onChange],
  );

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis, onChange, step]);

  if (typeof document === "undefined") return null;
  const image = index !== null ? images[index] : null;

  return createPortal(
    <AnimatePresence>
      {image && (
        <motion.div
          key="folio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, image ${(index ?? 0) + 1} of ${count}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[200] bg-[#030712]/95"
          onClick={() => onChange(null)}
          data-lenis-prevent
        >
          <motion.div
            key={image.src}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={image.fit === "contain" ? "absolute inset-[18%]" : "absolute inset-[clamp(1rem,6vh,4rem)_clamp(1rem,8vw,8rem)]"}
          >
            <Image src={image.src} alt="" fill sizes="90vw" className="object-contain" />
          </motion.div>

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-[clamp(1rem,3vw,2rem)] font-footer-text text-[0.75rem] text-white/70">
            <span className="uppercase tracking-[0.2em]">
              {title} · {(index ?? 0) + 1} / {count}
            </span>
            <button type="button" aria-label="Close" onClick={() => onChange(null)} className="grid size-10 place-items-center rounded-full bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)] transition-colors hover:bg-white/[0.12]">
              <XIcon className="size-4" />
            </button>
          </div>
          {count > 1 && (
            <>
              <NavButton side="left" onClick={() => step(-1)} />
              <NavButton side="right" onClick={() => step(1)} />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous image" : "Next image"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)] transition-colors hover:bg-white/[0.12] ${side === "left" ? "left-[clamp(0.75rem,2vw,1.5rem)]" : "right-[clamp(0.75rem,2vw,1.5rem)]"}`}
    >
      <Icon className="size-5" />
    </button>
  );
}
