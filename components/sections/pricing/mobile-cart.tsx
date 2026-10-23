"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { AnimatedNumber } from "./animated-number";

type MobileCartProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Show the floating bar (only while the pricing section is on screen) */
  visible: boolean;
  count: number;
  total: number;
  hasCustom: boolean;
  children: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Phones and tablets (below xl): a floating "Your Selection" bar that opens the enquiry panel as a bottom sheet. */
export function MobileCart({ open, onOpen, onClose, visible, count, total, hasCustom, children }: MobileCartProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div>
      <AnimatePresence>
        {visible && !open && (
          <motion.button
            type="button"
            onClick={onOpen}
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-[#0d0f24]/90 px-5 py-3.5 text-white shadow-[inset_0_0_0_1px_rgb(123_97_255/0.45),0_20px_50px_-15px_rgb(0_0_0/0.9)] backdrop-blur-md"
          >
            <span className="flex items-center gap-2.5 text-[0.9rem] font-medium">
              <ShoppingBag className="size-4 text-[#22d8ff]" />
              Your Selection
              <span className="grid min-w-5 place-items-center rounded-full bg-[#7b61ff] px-1.5 text-[0.72rem] font-bold">{count}</span>
            </span>
            <span className="font-footer-display text-[1.05rem] font-semibold">
              <AnimatedNumber value={total} />
              {hasCustom ? "+" : ""}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/60"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Your Selection"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88svh] overflow-y-auto rounded-t-[28px] bg-[#0a0c1f] px-5 pb-8 pt-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-white/20" />
                <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-3 grid size-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
                  <X className="size-4" />
                </button>
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
