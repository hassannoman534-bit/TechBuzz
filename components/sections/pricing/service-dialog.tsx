"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddonRow } from "./addon-row";
import { AnimatedNumber } from "./animated-number";
import { PackageCard } from "./package-card";
import { addonKey, discountForIndex, slotKey, type CartSummary, type PricingAction, type PricingState } from "./pricing-logic";
import { SERVICE_ICONS } from "./service-nav";
import type { PricingContent } from "./pricing.config";

type ServiceDialogProps = {
  content: PricingContent;
  state: PricingState;
  cart: CartSummary;
  dispatch: (a: PricingAction) => void;
  /** Open service index, or null */
  service: number | null;
  onClose: () => void;
  onReview: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One service, opened from its folder: tabs (YouTube), package cards, optional add-ons and a live total.
 * Desktop: a centred glass panel. Phones: a full height sheet. Esc closes; page scroll pauses while open.
 */
export function ServiceDialog({ content, state, cart, dispatch, service, onClose, onReview }: ServiceDialogProps) {
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [sub, setSub] = useState(0);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const open = service !== null;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setSub(0);
    setAddonsOpen(false);
  }, [service]);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis, onClose]);

  if (!mounted) return null;

  const svc = service !== null ? content.services[service] : null;
  const order = state.order.filter((k) => state.picked[k] !== undefined);

  return createPortal(
    <AnimatePresence>
      {svc && service !== null && (
        <motion.div key="svc-dialog" className="fixed inset-0 z-[120] flex items-end justify-center md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="absolute inset-0 bg-[#030712]/80" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="svc-dialog-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#0a0c1f] shadow-[inset_0_1px_0_rgb(255_255_255/0.1),inset_0_0_0_1px_rgb(255_255_255/0.07),0_40px_120px_-30px_rgb(0_0_0/0.9)] md:max-h-[86svh] md:max-w-[min(68rem,100%)] md:rounded-[28px]"
          >
            {(() => {
              const Icon = SERVICE_ICONS[svc.id];
              const tab = svc.subs[sub] ?? svc.subs[0];
              const key = slotKey(service, sub);
              const picked = state.picked[key];
              const pos = order.indexOf(key);
              const discount = discountForIndex(pos >= 0 ? pos : order.length, content.discount);
              const addonCount = tab.addons.reduce((n, g) => n + g.items.length, 0);
              return (
                <>
                  {/* header */}
                  <div className="shrink-0 border-b border-white/[0.06] px-[clamp(1.1rem,2.4vw,2rem)] pb-4 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,#7b61ff,#22a8ff)] text-white shadow-[0_10px_30px_-10px_rgb(123_97_255/0.9)]">
                          <Icon className="size-[1.1rem]" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <h2 id="svc-dialog-title" className="m-0">
                            <span className="block truncate font-footer-display text-[clamp(1.3rem,2vw,1.75rem)] font-medium leading-tight tracking-[-0.03em] text-white">{svc.label}</span>
                          </h2>
                          <p className="mt-0.5 text-[0.78rem] text-white/45">
                            {discount > 0 ? `This service gets ${Math.round(discount * 100)}% off as part of your bundle` : "Pick one package"}
                          </p>
                        </div>
                      </div>
                      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/70 outline-none ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/70">
                        <X className="size-4" />
                      </button>
                    </div>

                    {svc.subs.length > 1 && (
                      <div role="tablist" aria-label={`${svc.label} options`} className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                        {svc.subs.map((s, i) => {
                          const on = i === sub;
                          const has = state.picked[slotKey(service, i)] !== undefined;
                          return (
                            <button
                              key={s.label}
                              type="button"
                              role="tab"
                              aria-selected={on}
                              onClick={() => setSub(i)}
                              className={cn(
                                "relative isolate shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/70",
                                on ? "text-white" : "text-white/55 ring-1 ring-white/10 hover:text-white",
                              )}
                            >
                              {on && <motion.span layoutId="svc-tab" transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,#7b61ff,#5b7cff)]" />}
                              {s.label}
                              {has && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[#22d8ff] align-middle" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* body */}
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[clamp(1.1rem,2.4vw,2rem)] py-5 [scrollbar-width:thin]" data-lenis-prevent>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={sub} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
                        <div className="grid items-stretch gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))]">
                          {tab.pkgs.map((pkg, pi) => (
                            <PackageCard key={pkg.name} pkg={pkg} index={pi} selected={picked === pi} discount={discount} onToggle={() => dispatch({ type: "toggle", key, index: pi })} />
                          ))}
                        </div>

                        {addonCount > 0 && (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={() => setAddonsOpen((o) => !o)}
                              aria-expanded={addonsOpen}
                              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/[0.025] px-4 py-3 text-left outline-none ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/70"
                            >
                              <span className="flex items-baseline gap-2 whitespace-nowrap">
                                <span className="text-[0.85rem] font-medium text-white">Add-ons</span>
                                <span className="text-[0.75rem] text-white/40">{addonCount} extras, full price</span>
                              </span>
                              <ChevronDown className={cn("size-4 shrink-0 text-white/60 transition-transform duration-300", addonsOpen && "rotate-180")} />
                            </button>
                            <AnimatePresence initial={false}>
                              {addonsOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                                  {tab.addons.map((group, ci) => (
                                    <div key={`${group.cat}-${ci}`} className="mt-3">
                                      {group.cat && <p className="mb-2 text-[0.78rem] font-semibold text-[#c9c2ff]">{group.cat}</p>}
                                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                        {group.items.map((a, ai) => {
                                          const k = addonKey(service, sub, ci, ai);
                                          return <AddonRow key={k} addon={a} qty={state.qty[k] ?? 0} onChange={(d) => dispatch({ type: "qty", key: k, delta: d })} />;
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* footer */}
                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.06] px-[clamp(1.1rem,2.4vw,2rem)] py-3.5">
                    <div className="min-w-0 whitespace-nowrap">
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/40">Your plan</p>
                      <p className="font-footer-display text-[1.15rem] font-semibold tracking-[-0.02em] text-white">
                        <AnimatedNumber value={cart.total} />
                        {cart.hasCustom ? "+" : ""}
                        <span className="ml-2 font-footer-text text-[0.75rem] font-normal tracking-normal text-white/45">
                          {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={onClose} className="hidden rounded-full px-4 py-2.5 text-[0.85rem] font-medium text-white/75 ring-1 ring-white/15 transition-colors hover:bg-white/5 hover:text-white sm:block">
                        Keep browsing
                      </button>
                      <button
                        type="button"
                        onClick={onReview}
                        disabled={cart.items.length === 0}
                        className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(120deg,#7b61ff,#5b7cff_55%,#22a8ff)] px-5 py-2.5 text-[0.85rem] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_14px_34px_-14px_rgb(123_97_255/0.9)] outline-none transition-[transform,opacity] duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-40"
                      >
                        Review plan
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
