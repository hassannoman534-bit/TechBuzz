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
  /** Full designation, shown on the card */
  role: string;
  /** Short designation for the giant text on the second click (max ~16 letters) */
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

    // TODO Malik: roles below are placeholders. Replace role, short and team
    // with the real designations. Ghazanfar's is confirmed, the rest are not.
    { slug: "ahmed-zubair", name: "Ahmed Zubair", display: "Ahmed", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "usman-imtiaz", name: "Usman Imtiaz", display: "Imtiaz", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "saad-u-ghani", name: "Saad u Ghani", display: "Saad", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "ghazanfar", name: "Muhammad Ghazanfar", display: "Ghazanfar", role: "WordPress Developer", short: "WP Developer", team: "Development" },
    { slug: "shiza-ahmed", name: "Shiza Ahmed", display: "Shiza", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "bilal-haider", name: "Bilal Haider", display: "Bilal", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "awais-shahid", name: "Awais Shahid", display: "Awais", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "bazal-waheed", name: "Bazal Waheed", display: "Bazal", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "hadi-abbas", name: "M. Hadi Abbas", display: "Hadi", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "yousaf-adeel", name: "Yousaf Adeel", display: "Yousaf", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "asad-ahmed", name: "Asad Ahmed", display: "Asad", role: "Team Member", short: "Team Member", team: "Team" },
    { slug: "mohsin", name: "Mohsin", display: "Mohsin", role: "Team Member", short: "Team Member", team: "Team" },
  ],
};
