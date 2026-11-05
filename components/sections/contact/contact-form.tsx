"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";
import { GlassPanel } from "@/components/sections/site-footer/glass-panel";
import { GlassField } from "./glass-field";
import { ChoiceChips } from "./choice-chips";
import { SubmitButton } from "./submit-button";
import { FormSuccess } from "./form-success";
import { emptyContactForm, sendContact, type ContactForm as Form } from "./send-contact";
import type { ContactContent } from "./contact.config";

type Status = "idle" | "sending" | "sent" | "error";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const EASE = [0.22, 1, 0.36, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Add your name";
  if (!EMAIL.test(f.email.trim())) e.email = "Add an email we can reply to";
  if (!f.message.trim() && f.services.length === 0 && !f.role) e.message = "Pick a service or tell us a little about the project";
  return e;
}

/**
 * The glass form. Project mode: services, budget, details, message. Application mode
 * (/contact?role=<slug> from Careers): the role chip, details, portfolio link, message.
 * Sends with the site's EmailJS account; a hidden honeypot field drops bots silently.
 */
export function ContactForm({ content }: { content: ContactContent }) {
  const reduce = useReducedMotionSafe();
  const [form, setForm] = useState<Form>(emptyContactForm);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [sentTo, setSentTo] = useState("");
  const [trap, setTrap] = useState("");
  // The card keeps the form's height when it turns into the success state, so nothing jumps
  const body = useRef<HTMLDivElement>(null);
  const [lockH, setLockH] = useState<number | null>(null);

  // Read ?role= after mount (keeps the page static and the server HTML identical)
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("role");
    if (slug && content.roles[slug]) setForm((f) => ({ ...f, role: content.roles[slug] }));
  }, [content.roles]);

  const set = <K extends keyof Form>(k: K, v: Form[K]): void => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (tried) setErrors(validate(next));
  };
  const toggle = (k: "services" | "budget", v: string, single?: boolean): void => {
    const list = form[k];
    set(k, single ? (list[0] === v ? [] : [v]) : list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setTried(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = Object.keys(errs)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (status === "sending") return;
    setSentTo(form.email.trim());
    setLockH(body.current?.offsetHeight ?? null);
    if (trap) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      await sendContact(form);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const reset = (): void => {
    setForm((f) => ({ ...emptyContactForm, role: f.role }));
    setErrors({});
    setTried(false);
    setStatus("idle");
    setLockH(null);
  };

  const t = content.form;
  const app = content.application;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 56 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: EASE, delay: 0.45 }}
    >
      {/* No backdrop blur: on a card this large it repaints on every keystroke (handoff rule) */}
      <GlassPanel spotlight={!reduce} className="p-[clamp(1.25rem,3vw,2.75rem)] backdrop-blur-none">
        <div ref={body} style={lockH && status === "sent" ? { minHeight: lockH } : undefined} className="flex flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <FormSuccess heading={t.successHeading} body={t.successBody.replace("{email}", sentTo)} again={t.again} onAgain={reset} />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-col gap-[clamp(1.5rem,3svh,2rem)]"
            >
              <h2 className="text-white">
                <span className="font-footer-display text-[clamp(1.6rem,2.4vw,2.25rem)] font-medium tracking-[-0.03em]">
                  {form.role ? app.heading : t.heading}
                </span>
              </h2>

              {form.role ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[0.95rem] text-white/60">{app.label}</span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[linear-gradient(140deg,#7b61ff,#5b7cff_60%,#22a8ff)] py-2 pl-4 pr-2 text-[0.92rem] text-white">
                    {form.role}
                    <button
                      type="button"
                      onClick={() => set("role", null)}
                      aria-label="Not applying, start a project instead"
                      className="grid size-6 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                </div>
              ) : (
                <>
                  <ChoiceChips legend={t.servicesLabel} options={t.services} selected={form.services} onToggle={(v) => toggle("services", v)} />
                  <ChoiceChips legend={t.budgetLabel} options={t.budgets} selected={form.budget} onToggle={(v) => toggle("budget", v, true)} single />
                </>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <GlassField label="Name" name="name" autoComplete="name" required value={form.name} onChange={(v) => set("name", v)} error={errors.name} />
                <GlassField label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
                <GlassField label="Phone or WhatsApp" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(v) => set("phone", v)} />
                {form.role ? (
                  <GlassField label={app.portfolioLabel} name="portfolio" type="url" autoComplete="url" value={form.portfolio} onChange={(v) => set("portfolio", v)} />
                ) : (
                  <GlassField label="Company" name="company" autoComplete="organization" value={form.company} onChange={(v) => set("company", v)} />
                )}
                <GlassField
                  className="sm:col-span-2"
                  label={form.role ? "About you" : "About the project"}
                  name="message"
                  textarea
                  placeholder={form.role ? app.messagePlaceholder : "Goals, timeline, links"}
                  value={form.message}
                  onChange={(v) => set("message", v)}
                  error={errors.message}
                />
              </div>

              {/* honeypot: hidden from people and assistive tech */}
              <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SubmitButton label={t.submit} sendingLabel={t.sending} sending={status === "sending"} className="w-full sm:w-auto" />
                <AnimatePresence>
                  {status === "error" && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="max-w-[34ch] text-[0.92rem] text-[#ff8fa6]"
                    >
                      {t.errorBody}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
