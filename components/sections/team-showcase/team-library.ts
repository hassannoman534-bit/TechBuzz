import fs from "node:fs";
import path from "node:path";
import type { TeamMember, TeamShowcaseContent } from "./team-showcase.config";

export type TeamMemberData = TeamMember & {
  /** Public URL of the photo, or null when no file exists yet (monogram tile instead) */
  image: string | null;
  /** Two letters for the monogram fallback */
  initials: string;
};

const IMAGE = /\.(jpe?g|png|webp|avif)$/i;
const PREFERENCE = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

/** slug -> "/assets/team/<file>" for every photo in public/assets/team (build time). */
function readPhotos(): Map<string, string> {
  const dir = path.join(process.cwd(), "public", "assets", "team");
  const photos = new Map<string, string>();
  if (!fs.existsSync(dir)) return photos;

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE.test(f))
    .sort((a, b) => PREFERENCE.indexOf(path.extname(a).toLowerCase()) - PREFERENCE.indexOf(path.extname(b).toLowerCase()));

  for (const file of files) {
    const slug = path.basename(file, path.extname(file)).toLowerCase();
    if (!photos.has(slug)) photos.set(slug, `/assets/team/${encodeURIComponent(file)}`);
  }
  return photos;
}

function initialsOf(name: string): string {
  const words = name.replace(/^M\.\s*/i, "").split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : (words[0]?.[1] ?? "");
  return (first + last).toUpperCase();
}

/** Server only: pairs each configured member with their photo file. */
export function loadTeam(content: TeamShowcaseContent): TeamMemberData[] {
  const photos = readPhotos();
  return content.members.map((m) => ({
    ...m,
    image: photos.get(m.slug.toLowerCase()) ?? null,
    initials: initialsOf(m.name),
  }));
}
