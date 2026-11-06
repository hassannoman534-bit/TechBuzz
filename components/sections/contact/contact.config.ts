import { footerContent } from "@/components/sections/site-footer/footer.config";
import { careersContent } from "@/components/sections/careers/careers.config";

export type ContactChannel = {
  /** Small label, e.g. "WhatsApp" */
  label: string;
  /** The value shown large, e.g. the number */
  value: string;
  href: string;
  external?: boolean;
};

export type Studio = {
  city: string;
  lines: string[];
  mapHref: string;
  /** The head office shows the live clock and open status */
  primary?: boolean;
};

export type ContactContent = {
  heading: string;
  sub: string;
  /** The old site's line, set as the marquee */
  marquee: string;
  channels: ContactChannel[];
  /** Studio hours in Lahore time. SAMPLE: confirm before launch. */
  hours: { timeZone: string; zoneLabel: string; days: number[]; open: number; close: number; label: string };
  form: {
    heading: string;
    servicesLabel: string;
    services: string[];
    budgetLabel: string;
    budgets: string[];
    submit: string;
    sending: string;
    successHeading: string;
    /** {email} is replaced with the visitor's address */
    successBody: string;
    again: string;
    errorBody: string;
  };
  application: { heading: string; label: string; portfolioLabel: string; messagePlaceholder: string };
  studios: { heading: string; items: Studio[] };
  /** careers slug → role title, for /contact?role=<slug> */
  roles: Record<string, string>;
};

const mapSearch = (q: string): string => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const roles: Record<string, string> = Object.fromEntries(
  careersContent.roles.items.map((r) => [r.href.split("role=")[1] ?? "", r.title]),
);
roles["open-application"] = "Open application";

export const contactContent: ContactContent = {
  heading: "Let's talk.",
  sub: "Tell us what you are building. We reply within one working day.",
  marquee: "Let's work together",
  channels: [
    { label: "WhatsApp", value: footerContent.phones[0].display, href: footerContent.whatsapp.href, external: true },
    { label: "Email", value: footerContent.email, href: `mailto:${footerContent.email}` },
    { label: "Canada", value: footerContent.phones[1].display, href: footerContent.phones[1].href },
  ],
  hours: { timeZone: "Asia/Karachi", zoneLabel: "Lahore", days: [1, 2, 3, 4, 5, 6], open: 10, close: 19, label: "Mon to Sat, 10:00 to 19:00" },
  form: {
    heading: "Start a project",
    servicesLabel: "What do you need?",
    services: ["Social Media", "Paid Ads", "Content Production", "Branding", "AI Content", "SEO", "Web & Automation", "YouTube"],
    budgetLabel: "Monthly budget",
    budgets: ["Under $1k", "$1k to $3k", "$3k to $10k", "$10k plus"],
    submit: "Send message",
    sending: "Sending",
    successHeading: "Message sent.",
    successBody: "We will reply to {email} within one working day.",
    again: "Send another",
    errorBody: "That did not go through. Try again, or email us directly.",
  },
  application: {
    heading: "Join the team",
    label: "Applying for",
    portfolioLabel: "Portfolio or LinkedIn",
    messagePlaceholder: "A few lines about you and the work you are proud of",
  },
  studios: {
    heading: "Studios",
    items: [
      { city: "Lahore", lines: footerContent.studio.lines, mapHref: footerContent.studio.mapHref, primary: true },
      { city: "Karachi", lines: ["Tauheed Commercial Area, DHA", "Karachi 75500"], mapHref: mapSearch("Tauheed Commercial Area DHA Karachi") },
      { city: "Islamabad", lines: ["Almalik Center, 1st Floor", "G 7/2 Blue Area, Islamabad"], mapHref: mapSearch("Almalik Center Blue Area Islamabad") },
    ],
  },
  roles,
};
