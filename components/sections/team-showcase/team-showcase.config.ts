/**
 * Our Team roster. Order = order in the slider (leadership first).
 *
 * Photos: put one file per person in /public/assets/team/<slug>.(jpg|jpeg|png|webp|avif).
 * fetch_techbuzz_team.py already saves them with these slugs. A person without a photo
 * shows a monogram tile instead, so the page never breaks while photos are missing.
 * Best photo: portrait 4:5, at least 960×1200, face in the upper third.
 */

export type TeamLinks = {
  /** Full profile URL, e.g. https://www.linkedin.com/in/... */
  linkedin?: string;
  /** Plain address, e.g. usman@techbuzz.com.pk */
  email?: string;
};

export type TeamMember = {
  /** File name of the photo without extension, and the React key. Keep unique. */
  slug: string;
  /** Full name as shown on the card */
  name: string;
  /** The giant word behind the photo on the first click (one word reads best) */
  display: string;
  /**
   * The real job title. Shown on the card at the bottom when a member is
   * opened, and the one a screen reader announces.
   */
  role: string;
  /**
   * The nickname, for the giant knockout text on the second click and for the
   * small label on the rail tile. Deliberately not the job title: `role`
   * carries that on the card. It wraps, so two and three word nicknames are
   * fine, and "Chief Content Wizard" sets over two lines and fills the frame.
   * Leadership has no nickname, so theirs is a short form of the title.
   */
  short: string;
  /** One word group, shown as a tag on the card */
  team: string;
  /** Optional, one or two short sentences */
  bio?: string;
  links?: TeamLinks;
};

export type TeamShowcaseContent = {
  eyebrow: string;
  /** Small hint under the slider */
  hint: string;
  /** Label under the open photo before the second click */
  roleCue: string;
  members: TeamMember[];
};

export const teamContent: TeamShowcaseContent = {
  eyebrow: "The team",
  hint: "Drag to explore",
  roleCue: "Tap for role",
  members: [
    { slug: "usman-shabbir", name: "Usman Shabbir", display: "Usman", role: "Founder & CEO", short: "CEO", team: "Leadership" },
    { slug: "danial-sajid", name: "Danial Sajid", display: "Danial", role: "Managing Director", short: "Managing Director", team: "Leadership" },
    { slug: "muhammad-mehran", name: "Muhammad Mehran", display: "Mehran", role: "Chief Technology Officer", short: "CTO", team: "Leadership" },
    { slug: "hassan-noman", name: "Hassan Noman", display: "Hassan", role: "AI Developer", short: "AI & Web Maverick", team: "Development" },

    // TODO Malik: Ahmed Zubair was in neither the nickname list nor the
    // designation list. Placeholder until you send his titles, or remove the
    // entry if he has left.
    { slug: "ahmed-zubair", name: "Ahmed Zubair", display: "Ahmed", role: "Team Member", short: "Team Member", team: "Team" },

    { slug: "usman-imtiaz", name: "Usman Imtiaz", display: "Imtiaz", role: "Growth Marketing Strategist", short: "Growth Wizard", team: "Growth" },
    { slug: "saad-u-ghani", name: "Saad u Ghani", display: "Saad", role: "Performance Marketing Specialist", short: "Ad Ninja", team: "Performance" },
    { slug: "ghazanfar", name: "Muhammad Ghazanfar", display: "Ghazanfar", role: "Web Experience Architect", short: "Code Commander", team: "Development" },
    { slug: "shiza-ahmed", name: "Shiza Ahmed", display: "Shiza", role: "Organic Growth Specialist", short: "SEO Sorcerer", team: "SEO" },
    { slug: "bilal-haider", name: "Bilal Haider", display: "Bilal", role: "Head of Organic Growth", short: "Search Boss", team: "SEO" },
    { slug: "awais-shahid", name: "Awais Shahid", display: "Awais", role: "Creative Content Producer", short: "Content Alchemist", team: "Content" },
    { slug: "bazal-waheed", name: "Bazal Waheed", display: "Bazal", role: "Social Media Strategist", short: "Buzzmaker", team: "Social" },
    { slug: "hadi-abbas", name: "M. Hadi Abbas", display: "Hadi", role: "Head of Content & Storytelling", short: "Chief Content Wizard", team: "Content" },
    { slug: "yousaf-adeel", name: "Yousaf Adeel", display: "Yousaf", role: "Creative Director", short: "Creative Rockstar", team: "Creative" },
    { slug: "asad-ahmed", name: "Asad Ahmed", display: "Asad", role: "Senior Visual Storyteller", short: "Motion Magician", team: "Motion" },
    { slug: "mohsin", name: "Mohsin", display: "Mohsin", role: "Video Content Specialist", short: "Frame Ninja", team: "Creative" },
  ],
};
