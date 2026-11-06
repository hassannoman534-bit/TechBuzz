export type ServiceArt = "bars" | "rings" | "orbits" | "frames" | "peaks" | "windows" | "network";

export type Service = {
  title: string;
  description: string;
  href: string;
  art: ServiceArt;
};

export type ServicesContent = {
  eyebrow: string;
  heading: { lead: string; highlight: string };
  intro: string;
  services: Service[];
};

export const servicesContent: ServicesContent = {
  eyebrow: "( What we do )",
  heading: { lead: "Services built to", highlight: "scale results" },
  intro:
    "Seven disciplines under one roof, planned together and measured against the numbers that matter to your business.",
  services: [
    {
      title: "Search Engine Optimization",
      description:
        "We make your brand the answer people find first. Technical audits, content strategy and authority building that turn search into a steady source of qualified leads.",
      href: "/#services",
      art: "bars",
    },
    {
      title: "Paid Advertising",
      description:
        "Campaigns on Meta, Google and TikTok built around return, not reach. Sharp creative, precise targeting and weekly optimisation tied to revenue.",
      href: "/#services",
      art: "rings",
    },
    {
      title: "Social Media Marketing",
      description:
        "Content calendars, community management and platform strategy that keep your brand present, consistent and worth following.",
      href: "/#services",
      art: "orbits",
    },
    {
      title: "Content & Video Production",
      description:
        "Photography, short form video and YouTube content produced in house. Stories crafted for the feed and built to hold attention.",
      href: "/#services",
      art: "frames",
    },
    {
      title: "Branding & Identity",
      description:
        "Names, logos and visual systems that give your business a clear point of view. Every element designed to work together across every touchpoint.",
      href: "/#services",
      art: "peaks",
    },
    {
      title: "Web & App Development",
      description:
        "Fast, scalable websites and mobile apps engineered for conversion. From first wireframe to launch and ongoing care.",
      href: "/#services",
      art: "windows",
    },
    {
      title: "AI Automation",
      description:
        "Chat assistants, lead workflows and reporting pipelines that remove repetitive work, so your team can focus on growth.",
      href: "/#services",
      art: "network",
    },
  ],
};
