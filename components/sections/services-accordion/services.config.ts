export type ServiceArt = "bars" | "rings" | "orbits" | "frames" | "peaks" | "windows" | "network" | "play";

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
    "Eight disciplines under one roof, planned together and measured against the numbers that matter to your business.",
  /* Same eight services, names and order as the Services page (pricing labels; "Web & Automation" short title) */
  services: [
    {
      title: "Social Media",
      description:
        "Content calendars, community management and platform strategy that keep your brand present, consistent and worth following.",
      href: "/services",
      art: "orbits",
    },
    {
      title: "Paid Ads",
      description:
        "Campaigns on Meta, Google and TikTok built around return, not reach. Sharp creative, precise targeting and weekly optimisation tied to revenue.",
      href: "/services",
      art: "rings",
    },
    {
      title: "Content Production",
      description:
        "Photography, short form video and UGC produced in house. Stories crafted for the feed and built to hold attention.",
      href: "/services",
      art: "frames",
    },
    {
      title: "Branding",
      description:
        "Names, logos, menus and visual systems that give your business a clear point of view across every touchpoint.",
      href: "/services",
      art: "peaks",
    },
    {
      title: "AI Content",
      description:
        "AI avatars, voiceovers and generated visuals made to your brand standards. More content, faster, without losing your look.",
      href: "/services",
      art: "network",
    },
    {
      title: "SEO",
      description:
        "We make your brand the answer people find first. Technical audits, local SEO and content that turn search into a steady source of leads.",
      href: "/services",
      art: "bars",
    },
    {
      title: "Web & Automation",
      description:
        "Fast websites and apps engineered for conversion, plus chat assistants and lead workflows that take repetitive work off your team.",
      href: "/services",
      art: "windows",
    },
    {
      title: "YouTube",
      description:
        "Channel strategy, scripts, long form videos, Shorts and thumbnails, produced and published for steady growth.",
      href: "/services",
      art: "play",
    },
  ],
};
