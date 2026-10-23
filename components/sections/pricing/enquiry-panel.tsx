"use client";

import { useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { money, type CartSummary, type PricingAction } from "./pricing-logic";

export type EnquiryForm = { name: string; email: string; business: string; message: string };
export type SubmitStatus = "idle" | "sending" | "sent" | "error";

type EnquiryPanelProps = {
  cart: CartSummary;
  form: EnquiryForm;
  onForm: (f: EnquiryForm) => void;
  status: SubmitStatus;
  /** Snapshot of what was sent, shown on the success screen */
  sent: { form: EnquiryForm; cart: CartSummary } | null;
  onSubmit: () => void;
  onNew: () => void;
  dispatch: (a: PricingAction) => void;
  className?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  textarea,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder: string;
  required?: boolean;
  textarea?: boolean;
  invalid?: boolean;
}) {
  const id = useId();
  const cls = cn(
    "w-full rounded-xl bg-white/[0.035] px-3 py-2 text-[0.85rem] text-white placeholder:text-white/30 outline-none ring-1 transition-[box-shadow,background-color] duration-300 focus:bg-white/[0.05] focus:ring-[#7b61ff]/70",
    invalid ? "ring-[#ff6b8b]/70" : "ring-white/10",
  );
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[0.74rem] font-medium text-white/60">
        {label}
        {required && <span className="text-[#7ce9ff]"> *</span>}
      </label>
      {textarea ? (
        <textarea id={id} rows={2} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(cls, "resize-none")} />
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

/** Your details + live selection with bundle savings and total + Send Enquiry. Success screen after sending. */
export function EnquiryPanel({ cart, form, onForm, status, sent, onSubmit, onNew, dispatch, className }: EnquiryPanelProps) {
  const [tried, setTried] = useState(false);
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email.trim());
  const nameOk = form.name.trim().length > 0;

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    setTried(true);
    if (!nameOk || !emailOk || status === "sending") return;
    onSubmit();
  };

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" && sent ? (
          <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="mb-5 flex flex-col items-center text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="grid size-14 place-items-center rounded-full bg-[linear-gradient(140deg,#7b61ff,#22a8ff)] shadow-[0_16px_40px_-12px_rgb(123_97_255/0.8)]"
              >
                <CheckCircle2 className="size-7 text-white" strokeWidth={2} />
              </motion.span>
              <h3 className="mt-4 font-footer-display text-[1.5rem] font-semibold tracking-[-0.02em] text-white">Enquiry Received!</h3>
              <p className="mt-1 text-[0.9rem] text-white/60">Your selections are confirmed. We&apos;ll be in touch soon.</p>
            </div>
            <dl className="space-y-2 rounded-2xl bg-white/[0.03] p-4 text-[0.85rem] ring-1 ring-white/10">
              {[
                ["Name", sent.form.name],
                ["Email", sent.form.email],
                ["Business", sent.form.business],
                ["Message", sent.form.message],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="text-right text-white">{v}</dd>
                  </div>
                ))}
              {sent.cart.items.map((it) => (
                <div key={it.key} className="flex justify-between gap-4 border-t border-white/[0.06] pt-2">
                  <dt className="text-white/70">{it.name}</dt>
                  <dd className="text-white">{it.price === null ? "Custom" : money(it.price)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-white/10 pt-2 font-semibold">
                <dt className="text-white">Total</dt>
                <dd className="text-white">
                  {money(sent.cart.total)}
                  {sent.cart.hasCustom ? " + custom" : ""}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={onNew}
              className="mt-4 w-full rounded-full px-6 py-3 text-[0.92rem] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/5"
            >
              New Enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="mb-2.5 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/45">Your details</p>
            <div className="space-y-2.5">
              <Field label="Full Name" required value={form.name} placeholder="Jane Smith" invalid={tried && !nameOk} onChange={(v) => onForm({ ...form, name: v })} />
              <Field label="Email" type="email" required value={form.email} placeholder="jane@company.com" invalid={tried && !emailOk} onChange={(v) => onForm({ ...form, email: v })} />
              <Field label="Business" value={form.business} placeholder="Optional" onChange={(v) => onForm({ ...form, business: v })} />
              <Field label="Message" textarea value={form.message} placeholder="Goals or context..." onChange={(v) => onForm({ ...form, message: v })} />
            </div>

            <p className="mb-2 mt-5 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/45">Selection</p>
            <div className="rounded-2xl bg-white/[0.025] p-3 ring-1 ring-white/[0.08]">
              {cart.items.length === 0 ? (
                <p className="py-4 text-center text-[0.8rem] text-white/40">No services selected yet</p>
              ) : (
                <ul className="space-y-1.5">
                  <AnimatePresence initial={false}>
                    {cart.items.map((it) => (
                      <motion.li
                        key={it.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="group flex items-start gap-2 rounded-xl px-2 py-1.5 hover:bg-white/[0.03]">
                          <span className="min-w-0 flex-1 text-[0.83rem] leading-snug text-white/80">{it.name}</span>
                          <span className="shrink-0 text-right text-[0.83rem]">
                            {it.original !== null && <span className="mr-1.5 text-white/35 line-through">{money(it.original)}</span>}
                            <span className="font-medium text-white">{it.price === null ? "Custom" : money(it.price)}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: "remove", key: it.key, kind: it.kind })}
                            aria-label={`Remove ${it.name}`}
                            className="grid size-5 shrink-0 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              <div className="mt-3 space-y-1.5 border-t border-white/[0.08] px-2 pt-3 text-[0.85rem]">
                <AnimatePresence initial={false}>
                  {cart.savings > 0 && (
                    <motion.div key="sav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                      <div className="flex justify-between text-white/50">
                        <span>Before discount</span>
                        <AnimatedNumber value={cart.beforeDiscount} />
                      </div>
                      <div className="flex justify-between text-[#7ce9ff]">
                        <span>Bundle savings</span>
                        <span>
                          −<AnimatedNumber value={cart.savings} />
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-white/70">Total{cart.hasCustom ? " + custom" : ""}</span>
                  <span className="font-footer-display text-[1.3rem] font-semibold tracking-[-0.02em] text-white">
                    <AnimatedNumber value={cart.total} />
                    {cart.hasCustom ? "+" : ""}
                  </span>
                </div>
              </div>
            </div>

            {status === "error" && <p className="mt-3 text-[0.82rem] text-[#ff8aa3]">Something went wrong sending your enquiry. Please try again or message us on WhatsApp.</p>}
            {tried && (!nameOk || !emailOk) && <p className="mt-3 text-[0.82rem] text-[#ff8aa3]">Please enter your name and a valid email.</p>}

            {/* stays visible at the bottom while the details column scrolls */}
            <div className="sticky bottom-0 z-10 -mx-1 bg-[linear-gradient(to_bottom,transparent,#080b17_40%)] px-1 pb-0.5 pt-3">
            <button
              type="submit"
              disabled={status === "sending"}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(120deg,#7b61ff,#5b7cff_55%,#22a8ff)] px-6 py-3 text-[0.9rem] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_18px_40px_-16px_rgb(123_97_255/0.9)] outline-none transition-transform duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-70 [isolation:isolate]"
            >
              <span aria-hidden className="absolute inset-x-[-10%] top-full -z-10 aspect-square rounded-[45%] bg-[#4b3fd8] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[70%]" />
              {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
              {status === "sending" ? "Sending..." : "Send Enquiry"}
              {status !== "sending" && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />}
            </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
