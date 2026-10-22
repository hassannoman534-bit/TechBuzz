import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ClientLogo as ClientLogoData, WordmarkMark, WordmarkStyle } from "./client-wall.config";

const WORDMARK: Record<WordmarkStyle, string> = {
  display: "font-footer-display text-[clamp(1.15rem,1.75vw,1.75rem)] font-semibold tracking-[-0.045em]",
  serif: "font-serif text-[clamp(1.05rem,1.5vw,1.5rem)] italic tracking-[-0.02em]",
  caps: "font-footer-display text-[clamp(0.85rem,1.15vw,1.15rem)] font-semibold uppercase tracking-[0.2em]",
  mono: "font-mono text-[clamp(1.1rem,1.6vw,1.6rem)] font-bold uppercase tracking-[0.12em]",
  light: "font-sans text-[clamp(0.8rem,1.05vw,1.05rem)] font-light uppercase tracking-[0.22em]",
};

/** Tile height / width (tiles are 16:10 on every screen) */
const TILE_RATIO = 10 / 16;

/**
 * Logo box size as a share of the tile, from the logo's aspect ratio, so every logo has a similar
 * visual weight: square icons get a taller box, long wordmarks a wider but lower one.
 * Without width and height it falls back to one fixed box and the logo is contained in it.
 */
function logoBox(w?: number, h?: number): CSSProperties {
  if (!w || !h) return { width: "66%", height: "46%" };
  const aspect = w / h;
  let hf = Math.min(0.42, 0.4 * Math.pow(aspect, -0.4));
  let wf = hf * aspect * TILE_RATIO;
  if (wf > 0.6) {
    wf = 0.6;
    hf = wf / (aspect * TILE_RATIO);
  }
  return { width: `${(wf * 100).toFixed(2)}%`, height: `${(hf * 100).toFixed(2)}%` };
}

function Mark({ mark }: { mark: WordmarkMark }) {
  if (mark === "none") return null;
  const base = "shrink-0";
  if (mark === "dot") return <span className={cn(base, "size-[0.45em] rounded-full bg-current")} />;
  if (mark === "ring") return <span className={cn(base, "size-[0.9em] rounded-full border-[0.14em] border-current")} />;
  if (mark === "square") return <span className={cn(base, "size-[0.75em] rotate-45 bg-current")} />;
  // spark: four point star
  return (
    <svg viewBox="0 0 24 24" className={cn(base, "size-[1em]")} fill="currentColor" aria-hidden>
      <path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0Z" />
    </svg>
  );
}

/** A client's logo file, or a styled wordmark placeholder until the file is added. White on the dark wall. */
export function ClientLogo({ client }: { client: ClientLogoData }) {
  if (client.logo) {
    // The logo fills a box sized from its aspect ratio (see logoBox), so wide wordmarks and square
    // icons read at an even visual size. `scale` fine tunes a single logo.
    const box = logoBox(client.logo.width, client.logo.height);
    return (
      <span className="relative block" style={{ ...box, transform: client.scale ? `scale(${client.scale})` : undefined }}>
        <Image
          src={client.logo.src}
          alt={client.name}
          fill
          sizes="(min-width: 768px) 18vw, 40vw"
          draggable={false}
          className={cn("object-contain select-none", client.mono !== false && "[filter:brightness(0)_invert(1)]")}
        />
      </span>
    );
  }
  return (
    <span className={cn("flex max-w-[84%] items-center justify-center gap-[0.45em] text-center leading-[1.15] text-white", WORDMARK[client.style ?? "display"])}>
      <Mark mark={client.mark ?? "none"} />
      <span className="text-balance">{client.name}</span>
    </span>
  );
}
