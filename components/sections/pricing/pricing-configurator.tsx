"use client";

import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { CheckoutDrawer } from "./checkout-drawer";
import { EnquiryPanel, type EnquiryForm, type SubmitStatus } from "./enquiry-panel";
import { FolderShelf } from "./folder-shelf";
import { SelectionBar } from "./selection-bar";
import { ServiceDialog } from "./service-dialog";
import { pricingCopy } from "./pricing-folders.config";
import { buildCart, discountForIndex, emptyState, money, pricingReducer, type CartSummary } from "./pricing-logic";
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
 * Pricing page, folder edition: the eight services sit on one screen as glass folders. Hover a folder to
 * see its packages peek out, click it to open the service (packages, tabs, add-ons). A floating plan bar
 * keeps the live total and opens the checkout (details + summary + Send). Same data, discount rules and
 * EmailJS template as the current site.
 */
export function PricingConfigurator({ content = pricingContent, className }: PricingConfiguratorProps) {
  const reduce = useReducedMotionSafe();
  const [state, dispatch] = useReducer(pricingReducer, emptyState);
  const [service, setService] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState<EnquiryForm>(emptyForm);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [sent, setSent] = useState<{ form: EnquiryForm; cart: CartSummary } | null>(null);

  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: 0.05 });

  const cart = useMemo(() => buildCart(content, state), [content, state]);
  const picks = state.order.filter((k) => state.picked[k] !== undefined).length;
  const nextDiscount = discountForIndex(picks, content.discount);
  const t1 = Math.round(content.discount.tier1 * 100);
  const t2 = Math.round(content.discount.tier2 * 100);

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
    setCheckout(false);
  }, []);

  const closeService = useCallback(() => setService(null), []);
  const closeCheckout = useCallback(() => setCheckout(false), []);
  const review = useCallback(() => {
    setService(null);
    setCheckout(true);
  }, []);

  return (
    <section
      ref={section}
      id="pricing"
      data-atmo="pricing"
      aria-labelledby="pricing-title"
      className={cn(
        "relative bg-[#030712] px-[clamp(1rem,4vw,5rem)] pb-[clamp(7rem,14vh,9rem)] pt-[calc(var(--nav-offset,5.5rem)+clamp(0.25rem,2vh,1.5rem))] text-white lg:min-h-svh",
        className,
      )}
    >
      <FolderShelf
        content={content}
        state={state}
        onOpen={setService}
        reservedPx={330}
        header={
          <motion.header
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-[clamp(1.25rem,4vh,2.75rem)] flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10"
          >
            <div className="shrink-0">
              <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/45">{pricingCopy.eyebrow}</p>
              <h1 id="pricing-title" className="m-0 mt-2">
                <span className="block whitespace-nowrap font-footer-display text-[clamp(1.9rem,3.4vw,3rem)] font-medium leading-none tracking-[-0.045em] text-white">{pricingCopy.title}</span>
              </h1>
            </div>
            <div className="flex flex-col gap-2 md:max-w-[27rem] md:items-end md:text-right">
              <p className="text-[0.85rem] leading-relaxed text-white/55">{pricingCopy.sub.replace("{t1}", String(t1)).replace("{t2}", String(t2))}</p>
              <div className="flex min-h-7 items-center gap-2 whitespace-nowrap">
                <AnimatePresence mode="popLayout" initial={false}>
                  {picks > 0 && (
                    <motion.span
                      key={nextDiscount}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="rounded-full bg-[#22d8ff]/10 px-3 py-1 text-[0.72rem] font-medium text-[#7ce9ff] ring-1 ring-[#22d8ff]/30"
                    >
                      Next service {Math.round(nextDiscount * 100)}% off
                    </motion.span>
                  )}
                </AnimatePresence>
                {cart.savings > 0 && <span className="text-[0.72rem] text-white/45">saving {money(cart.savings)}</span>}
                {cart.items.length > 0 && (
                  <button type="button" onClick={() => dispatch({ type: "reset" })} className="rounded-full px-3 py-1 text-[0.72rem] text-white/50 ring-1 ring-white/10 transition-colors hover:text-white">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.header>
        }
      />

      <SelectionBar cart={cart} visible={inView && service === null && !checkout} emptyLabel={pricingCopy.empty} reviewLabel={pricingCopy.review} onReview={() => setCheckout(true)} />

      <ServiceDialog content={content} state={state} cart={cart} dispatch={dispatch} service={service} onClose={closeService} onReview={review} />

      <CheckoutDrawer open={checkout} onClose={closeCheckout}>
        <EnquiryPanel cart={cart} form={form} onForm={setForm} status={status} sent={sent} onSubmit={submit} onNew={startNew} dispatch={dispatch} />
      </CheckoutDrawer>
    </section>
  );
}
