import { emailConfig } from "@/components/sections/pricing/pricing.config";

export type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  portfolio: string;
  message: string;
  services: string[];
  budget: string[];
  /** Careers role title when the visitor came from an Apply link */
  role: string | null;
};

export const emptyContactForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  portfolio: "",
  message: "",
  services: [],
  budget: [],
  role: null,
};

/**
 * Template for contact messages. Until a dedicated EmailJS template exists, this reuses the
 * pricing template and its params (from_name, reply_to, business, message, services, ...), so
 * messages already arrive in the same inbox. Set NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID to
 * switch to a contact template without touching code.
 */
const templateId = process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID ?? emailConfig.templateId;

function params(f: ContactForm): Record<string, string> {
  const kind = f.role ? `Job application: ${f.role}` : "Contact form";
  const lines = [
    `Source: ${kind}`,
    f.phone && `Phone: ${f.phone}`,
    f.company && `Company: ${f.company}`,
    f.portfolio && `Portfolio: ${f.portfolio}`,
    f.budget.length > 0 && `Budget: ${f.budget[0]}`,
  ].filter(Boolean);
  return {
    from_name: f.name,
    reply_to: f.email,
    business: f.role ? kind : f.company || "Not specified",
    message: `${f.message || "No message"}\n\n${lines.join("\n")}`,
    services: f.role ? `• ${kind}` : f.services.map((s) => `• ${s}`).join("\n") || "• Not specified",
    totals_html: "",
    total_amount: kind,
    has_discount: "no",
    discount_amount: "",
    before_discount: "",
    has_custom: "no",
    date: new Date().toLocaleDateString(),
    _safe_check: "ok",
  };
}

export async function sendContact(f: ContactForm): Promise<void> {
  const emailjs = (await import("@emailjs/browser")).default;
  await emailjs.send(emailConfig.serviceId, templateId, params(f), { publicKey: emailConfig.publicKey });
}
