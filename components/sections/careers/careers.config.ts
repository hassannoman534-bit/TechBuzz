import type { PageHeroContent } from "@/components/sections/page-hero/page-hero";

export type RoleIcon = "social" | "account" | "consultant" | "ecommerce" | "design" | "ppc" | "seo" | "video" | "other";

export type CareerRole = {
  title: string;
  /** Team or field, shown on the right of the row */
  team: string;
  /** Optional work type, e.g. "Remote", "Full time", "On site, Lahore" */
  type?: string;
  /** One line about the role, shown in the floating preview */
  summary: string;
  /** Where the row links to (apply / details) */
  href: string;
  /** Background tint of the floating preview for this role (any CSS colour) */
  color: string;
  /** Icon shown in the floating preview (see ROLE_ICONS in role-preview.tsx) */
  icon: RoleIcon;
};

export type CareersContent = {
  hero: PageHeroContent;
  roles: {
    heading: string;
    /** Text inside the round cursor that follows the pointer */
    cursorLabel: string;
    note: { text: string; linkLabel: string; href: string };
    items: CareerRole[];
  };
  growth: { eyebrow: string; lines: string[]; body: string; perks: string[] };
  culture: { eyebrow: string; heading: string; values: { title: string; text: string }[] };
};

/** Apply links go to the contact page with the role in the query, so the form can prefill it. */
const apply = (slug: string): string => `/contact?role=${slug}`;

export const careersContent: CareersContent = {
  hero: {
    eyebrow: "Careers",
    lines: ["Be part of", "something great"],
    sub: "We are looking for curious, driven people who want to grow their craft and help brands win online.",
  },
  roles: {
    heading: "Open roles",
    cursorLabel: "Apply",
    note: { text: "Don't see your role?", linkLabel: "Send us your work", href: "/contact?role=open-application" },
    items: [
      { title: "Social Media Strategy", team: "Marketing", summary: "Plan content and campaigns that grow engaged communities for our clients.", href: apply("social-media-strategy"), color: "#1d1846", icon: "social" },
      { title: "Account Management", team: "Client Success", summary: "Be the trusted point of contact who keeps every project clear and on track.", href: apply("account-management"), color: "#13223f", icon: "account" },
      { title: "Marketing Consultant", team: "Strategy", summary: "Turn business goals into clear, measurable marketing plans.", href: apply("marketing-consultant"), color: "#0f2a3a", icon: "consultant" },
      { title: "E-commerce Store", team: "E-commerce", summary: "Build, run and grow online stores that convert.", href: apply("e-commerce-store"), color: "#0e2e2a", icon: "ecommerce" },
      { title: "Graphic Design", team: "Design", summary: "Design brand identities, social creatives and print that people remember.", href: apply("graphic-design"), color: "#2a1840", icon: "design" },
      { title: "PPC Strategy", team: "Advertising", summary: "Plan and optimise paid campaigns on Google and Meta for real returns.", href: apply("ppc-strategy"), color: "#2b1d12", icon: "ppc" },
      { title: "SEO Strategy", team: "Search", summary: "Grow organic traffic with smart technical, content and link strategy.", href: apply("seo-strategy"), color: "#122a1c", icon: "seo" },
      {
        title: "Video Editor",
        team: "Content",
        type: "Remote",
        summary: "Edit engaging videos for a US focused YouTube channel. Premiere and After Effects, 6 months or more.",
        href: apply("video-editor"),
        color: "#30121f",
        icon: "video",
      },
    ],
  },
  growth: {
    eyebrow: "Grow with us",
    lines: ["Room to learn,", "space to grow"],
    body: "Whether you are starting out or ready for your next step, you get a supportive team, ongoing training and real room to move up, with pay and perks that keep you going.",
    perks: [
      "Training and development",
      "Career advancement",
      "A friendly, collaborative team",
      "Competitive pay",
      "Flexible schedules",
      "Extra perks along the way",
    ],
  },
  culture: {
    eyebrow: "Our culture",
    heading: "What we value",
    values: [
      { title: "Empowerment", text: "Follow your interests and build skills beyond your daily tasks." },
      { title: "Appreciation", text: "Good work gets noticed, and so does helping others reach their goals." },
      { title: "Teamwork", text: "Trust, empathy and respect for each other's skills and ideas." },
      { title: "Integrity", text: "Fair and honest with our team, our clients and our community." },
      { title: "Nurturing", text: "Leaders who back your personal and professional growth." },
      { title: "Balance", text: "A healthy work life balance, because rested people do their best work." },
    ],
  },
};
