"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { X } from "lucide-react";

type CheckoutDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Your details + selection + Send. Desktop: a panel from the right. Phones: a bottom sheet. */
export function CheckoutDrawer({ open, onClose, children }: CheckoutDrawerProps) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 768px)");
    const update = (): void => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="checkout" className="fixed inset-0 z-[125]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="absolute inset-0 bg-[#030712]/75" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Your plan"
            initial={wide ? { x: "100%" } : { y: "100%" }}
            animate={wide ? { x: 0 } : { y: 0 }}
            exit={wide ? { x: "100%" } : { y: "100%" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="absolute inset-x-0 bottom-0 max-h-[90svh] overflow-y-auto overscroll-contain rounded-t-[28px] bg-[#0a0c1f] px-5 pb-6 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] [scrollbar-width:thin] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(27rem,100%)] md:rounded-none md:rounded-l-[28px] md:px-6 md:pt-6"
            data-lenis-prevent
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
