import { cn } from "@/lib/utils";
import { FolioChapter } from "./folio-chapter";
import { loadFolioChapters } from "./folio-library";
import { folioContent, type FolioShowcaseContent } from "./folio-showcase.config";

type FolioShowcaseProps = { content?: FolioShowcaseContent; className?: string };

/**
 * Portfolio folios: one pinned scroll expansion per folio (Creative Designs, SMM Creatives, Shootfolio,
 * Webfolio, SEO Results, YouTube Automation). Server component: reads the downloaded images from
 * /public at build time and hands each chapter its cover and film strip.
 */
export function FolioShowcase({ content = folioContent, className }: FolioShowcaseProps) {
  const chapters = loadFolioChapters(content);
  if (!chapters.length) return null;

  return (
    <div id="folios" className={cn("relative bg-[#030712]", className)}>
      <div className="flex flex-col items-center pt-[clamp(4rem,10vh,7rem)] pb-[clamp(1rem,3vh,2rem)]">
        <p className="font-footer-text text-[0.7rem] uppercase tracking-[0.22em] text-white/45">{content.eyebrow}</p>
        <span aria-hidden className="mt-4 h-[clamp(3rem,9vh,5rem)] w-px bg-gradient-to-b from-white/30 to-white/0" />
      </div>
      {chapters.map((chapter, i) => (
        <FolioChapter key={chapter.id} chapter={chapter} index={i} total={chapters.length} />
      ))}
    </div>
  );
}
