"use client";

import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { ServiceNav } from "./service-nav";
import { PackageCard } from "./package-card";
import { AddonRow } from "./addon-row";
import { BundleBanner } from "./bundle-banner";
import { EnquiryPanel, type EnquiryForm, type SubmitStatus } from "./enquiry-panel";
import { MobileCart } from "./mobile-cart";
import { addonKey, buildCart, discountForIndex, emptyState, money, pricingReducer, slotKey, type CartSummary } from "./pricing-logic";
import { emailConfig, pricingContent, type PricingContent } from "./pricing.config";

type PricingConfiguratorProps = { content?: PricingContent; className?: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const emptyForm: EnquiryForm = { name: "", email: "", business: "", message: "" };

/** Email body parts, same template params as the current site (so the existing EmailJS template keeps working). */
function emailParams(form: EnquiryForm, cart: CartSummary): Record<string, string> {
  const services = cart.items.map((it) => `• ${it.name} — ${it.price === null ? "Custom" : money(it.price)}`).join("\n");
  const totalsHtml =
    (cart.savings > 0
      ? `<div class="tot-row"><span class="tl">Before discount</span><span class="tv">${money(cart.beforeDiscount)}</span></div>` +
        `<div class="tot-row"><span class="tl">Bundle savings</span><span class="tv" style="color:#ff4d4d">−${money(cart.savings)}</span></div>`
      : "") +
    `<div class="tot-row final"><span class="tl">Total Amount${cart.hasCustom ? " + custom" : ""}</span><span class="tv">${money(cart.total)}${cart.hasCustom ? "+" : ""}</span></div>`;
  return {
    from_name: form.name || "Not provided",
    reply_to: form.email || "notprovided@email.com",
    business: form.business || "Not specified",
    message: form.message || "No additional message",
    services,
    totals_html: totalsHtml,
    total_amount: `${money(cart.total)}${cart.hasCustom ? " + custom" : ""}`,
    has_discount: cart.savings > 0 ? "yes" : "no",
    discount_amount: cart.savings > 0 ? money(cart.savings) : "",
    before_discount: cart.savings > 0 ? money(cart.beforeDiscount) : "",
    has_custom: cart.hasCustom ? "yes" : "no",
    date: new Date().toLocaleDateString(),
    _safe_check: "ok",
  };
}

/**
 * Pricing configurator (all data from the current pricing page):
 * services on the left, packages and add-ons in the middle, details + live total on the right.
 * Bundle discount by pick order (2nd service 20% off, 3rd and later 50% off), add-ons at full price.
 * Enquiries go out through the same EmailJS template as the current site.
 */
export function PricingConfigurator({ content = pricingContent, className }: PricingConfiguratorProps) {
  const reduce = useReducedMotionSafe();
  const [state, dispatch] = useReducer(pricingReducer, emptyState);
  const [active, setActive] = useState(0);
  const [subBySvc, setSubBySvc] = useState<Record<number, number>>({});
  const [form, setForm] = useState<EnquiryForm>(emptyForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [sent, setSent] = useState<{ form: EnquiryForm; cart: CartSummary } | null>(null);
  const [sheet, setSheet] = useState(false);

  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: 0.05 });

  const cart = useMemo(() => buildCart(content, state), [content, state]);
  const order = state.order.filter((k) => state.picked[k] !== undefined);
  const nextDiscount = discountForIndex(order.length, content.discount);
  const selectedSvcs = useMemo(() => new Set(order.map((k) => Number(k.split("-")[0]))), [order]);

  const svc = content.services[active];
  const subIndex = subBySvc[active] ?? 0;
  const sub = svc.subs[subIndex];
  const key = slotKey(active, subIndex);
  const pickedHere = state.picked[key];
  const slotPos = order.indexOf(key);
  // discount this slot has (already picked) or would get (next in line)
  const slotDiscount = discountForIndex(slotPos >= 0 ? slotPos : order.length, content.discount);

  const submit = useCallback(async () => {
    setStatus("sending");
    try {
      const emailjs = (await import("@emailjs/browser")).default;
      await emailjs.send(emailConfig.serviceId, emailConfig.templateId, emailParams(form, cart), { publicKey: emailConfig.publicKey });
      setSent({ form, cart });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }, [form, cart]);

  const startNew = useCallback(() => {
    dispatch({ type: "reset" });
    setForm(emptyForm);
    setSent(null);
    setStatus("idle");
  }, []);

  const panel = (
    <EnquiryPanel cart={cart} form={form} onForm={setForm} status={status} sent={sent} onSubmit={submit} onNew={startNew} dispatch={dispatch} />
  );

  // Switching service or tab starts the middle column at the top.
  const centerScroll = useRef<HTMLDivElement>(null);
  const pickService = useCallback((i: number) => {
    setActive(i);
    centerScroll.current?.scrollTo({ top: 0 });
  }, []);

  const panelBox =
    "rounded-[22px] bg-white/[0.02] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]";
  /** each desktop column fills the screen height and scrolls on its own */
  const colScroll =
    "lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.14)_transparent]";

  return (
    <section
      ref={section}
      id="pricing"
      aria-labelledby="pricing-title"
      className={cn(
        "relative bg-[#030712] px-[clamp(0.75rem,2.2vw,2.5rem)] pb-[clamp(5rem,12vh,8rem)] pt-[calc(var(--nav-offset,5.5rem)+1rem)] text-white",
        // desktop: one full screen app panel, nothing cut off
        "lg:flex lg:h-svh lg:min-h-[38rem] lg:flex-col lg:pb-4",
        className,
      )}
    >
      <h1 id="pricing-title" className="sr-only">
        Pricing
      </h1>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className="mx-auto flex w-full max-w-[96rem] flex-col gap-3 lg:min-h-0 lg:flex-1"
      >
        <BundleBanner content={content} state={state} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_19.5rem] 2xl:grid-cols-[16.5rem_minmax(0,1fr)_21rem]">
          {/* services */}
          <aside className={cn("min-w-0 lg:rounded-[22px] lg:bg-white/[0.02] lg:p-3 lg:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.07)]", colScroll)} data-lenis-prevent>
            <ServiceNav services={content.services} active={active} selected={selectedSvcs} nextDiscount={nextDiscount} onSelect={pickService} />
          </aside>

          {/* packages + add-ons: header stays, content scrolls */}
          <div className={cn("flex min-w-0 flex-col lg:min-h-0", panelBox)}>
            <div className="shrink-0 border-b border-white/[0.06] px-[clamp(1rem,1.6vw,1.5rem)] pb-3 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-footer-display text-[clamp(1.25rem,1.6vw,1.6rem)] font-medium tracking-[-0.03em]">{svc.label}</h2>
                  <span className="text-[0.78rem] text-white/45">Select a package</span>
                </div>
                {pickedHere !== undefined && <p className="text-[0.75rem] text-white/45">Click the selected package again to remove it</p>}
              </div>

              {svc.subs.length > 1 && (
                <div role="tablist" aria-label={`${svc.label} options`} className="mt-3 flex flex-wrap gap-1.5">
                  {svc.subs.map((s, i) => {
                    const on = i === subIndex;
                    const has = state.picked[slotKey(active, i)] !== undefined;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => {
                          setSubBySvc((m) => ({ ...m, [active]: i }));
                          centerScroll.current?.scrollTo({ top: 0 });
                        }}
                        className={cn(
                          "relative isolate rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#7b61ff]/70",
                          on ? "text-white" : "text-white/55 ring-1 ring-white/10 hover:text-white",
                        )}
                      >
                        {on && (
                          <motion.span
                            layoutId="pricing-sub-active"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,#7b61ff,#5b7cff)]"
                          />
                        )}
                        {s.label}
                        {has && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[#22d8ff] align-middle" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={centerScroll} className={cn("px-[clamp(1rem,1.6vw,1.5rem)] py-4 lg:flex-1", colScroll)} data-lenis-prevent>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${active}-${subIndex}`}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <div className="grid items-stretch gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,12.5rem),1fr))]">
                    {sub.pkgs.map((pkg, pi) => (
                      <PackageCard
                        key={pkg.name}
                        pkg={pkg}
                        index={pi}
                        selected={pickedHere === pi}
                        discount={slotDiscount}
                        onToggle={() => dispatch({ type: "toggle", key, index: pi })}
                      />
                    ))}
                  </div>

                  {sub.addons.some((g) => g.items.length > 0) && (
                    <div className="mt-7">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/45">Add-ons</p>
                        <p className="text-[0.75rem] text-white/40">Optional extras, billed at full price</p>
                      </div>
                      {sub.addons.map((group, ci) => (
                        <div key={`${group.cat}-${ci}`} className="mt-3">
                          {group.cat && <p className="mb-2 text-[0.8rem] font-semibold text-[#c9c2ff]">{group.cat}</p>}
                          <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
                            {group.items.map((a, ai) => {
                              const k = addonKey(active, subIndex, ci, ai);
                              return <AddonRow key={k} addon={a} qty={state.qty[k] ?? 0} onChange={(d) => dispatch({ type: "qty", key: k, delta: d })} />;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* details + summary (desktop) */}
          <aside className={cn("hidden min-w-0 p-4 xl:block", panelBox, colScroll)} data-lenis-prevent>
            {panel}
          </aside>
        </div>
      </motion.div>

      {/* below xl: floating selection bar + bottom sheet */}
      <div className="xl:hidden">
        <MobileCart
          open={sheet}
          onOpen={() => setSheet(true)}
          onClose={() => setSheet(false)}
          visible={inView}
          count={cart.items.length}
          total={cart.total}
          hasCustom={cart.hasCustom}
        >
          {panel}
        </MobileCart>
      </div>
    </section>
  );
}
