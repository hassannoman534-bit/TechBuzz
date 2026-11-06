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
    { slug: "gulraiz-masood", name: "Gulraiz Masood", display: "Gulraiz", role: "IT Director", short: "IT Director", team: "Leadership" },
    { slug: "hasan-arif", name: "Hasan Arif", display: "Hasan", role: "Director", short: "Director", team: "Leadership" },
    { slug: "ahmad-khan-lodhi", name: "Ahmad Khan Lodhi", display: "Ahmad", role: "Chief Marketing Officer", short: "CMO", team: "Leadership" },
    { slug: "ali-shabbir", name: "M. Ali Shabbir", display: "Ali", role: "Head of Performance Marketing", short: "Performance Lead", team: "Marketing" },
    { slug: "zargham-ali", name: "Zargham Ali", display: "Zargham", role: "Creative Director", short: "Creative Director", team: "Design" },
    { slug: "umer-faheem", name: "Umer Faheem", display: "Umer", role: "SEO Consultant", short: "SEO Consultant", team: "SEO" },
    { slug: "shiza-daha", name: "Shiza Daha", display: "Shiza", role: "SEO Executive", short: "SEO Executive", team: "SEO" },
    { slug: "sana-chaudhary", name: "Sana Chaudhary", display: "Sana", role: "SEO Expert", short: "SEO Expert", team: "SEO" },
    { slug: "nabeel", name: "M. Nabeel", display: "Nabeel", role: "SEO Expert", short: "SEO Expert", team: "SEO" },
    { slug: "jaysha-khan", name: "Jaysha Khan", display: "Jaysha", role: "Junior SEO", short: "Junior SEO", team: "SEO" },
    { slug: "hira-rasheed", name: "Hira Rasheed", display: "Hira", role: "Junior SEO & WordPress Developer", short: "SEO Developer", team: "SEO" },
    { slug: "abdur-rehman", name: "Abdur Rehman", display: "Rehman", role: "Graphic Designer", short: "Designer", team: "Design" },
    { slug: "yousaf-adeel", name: "M. Yousaf Adeel", display: "Yousaf", role: "Graphic Designer", short: "Designer", team: "Design" },
    { slug: "bilal-butt", name: "Bilal Butt", display: "Bilal", role: "Video Editor", short: "Video Editor", team: "Video" },
    { slug: "zeeshan", name: "M. Zeeshan", display: "Zeeshan", role: "Video Editor", short: "Video Editor", team: "Video" },
    { slug: "asad-ahmad", name: "M. Asad Ahmad", display: "Asad", role: "Video Editor", short: "Video Editor", team: "Video" },
    { slug: "kisa-zahra", name: "Kisa Zahra", display: "Kisa", role: "Senior Script Writer", short: "Script Writer", team: "Content" },
    { slug: "fatima-mehboob", name: "Fatima Mehboob", display: "Fatima", role: "Script Writer Intern", short: "Script Writer", team: "Content" },
    { slug: "aqsa-khan", name: "Aqsa Khan", display: "Aqsa", role: "Senior Content Writer", short: "Content Writer", team: "Content" },
    { slug: "fakhriya", name: "Fakhriya", display: "Fakhriya", role: "Content Writer", short: "Content Writer", team: "Content" },
    { slug: "saba-gill", name: "Saba Gill", display: "Saba", role: "Content Writer", short: "Content Writer", team: "Content" },
    { slug: "nouman-butt", name: "M. Nouman Butt", display: "Nouman", role: "Senior WordPress & Shopify Developer", short: "Developer", team: "Development" },
    { slug: "bilal-ahmad", name: "M. Bilal Ahmad", display: "Bilal", role: "Senior WordPress & Shopify Developer", short: "Developer", team: "Development" },
    { slug: "ghazanfar", name: "M. Ghazanfar", display: "Ghazanfar", role: "Junior WordPress & Shopify Developer", short: "Developer", team: "Development" },
    { slug: "awais", name: "M. Awais", display: "Awais", role: "Junior Content Creator", short: "Content Creator", team: "Content" },
    { slug: "faiqa", name: "Faiqa", display: "Faiqa", role: "Content Creator Intern", short: "Content Creator", team: "Content" },
  ],
};
