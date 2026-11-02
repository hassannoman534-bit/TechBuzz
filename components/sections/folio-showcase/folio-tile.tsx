"use client";

import Image from "next/image";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FolioImage } from "./folio-library";

type FolioTileProps = {
  image: FolioImage;
  index: number;
  onOpen: (index: number) => void;
};

/**
 * One film strip tile. Photos and posters fill the tile; logos sit whole on a glass plate with breathing
 * room. Hover: the tile lifts, the picture zooms, an accent rim and a light sweep pass over it, and an
 * open button appears. CSS transitions only (transform / opacity), so the scroll driven strip stays smooth.
 */
export function FolioTile({ image, index, onOpen }: FolioTileProps) {
  const logo = image.fit === "contain";
  return (
    <button
      type="button"
      data-folio-tile
      onClick={() => onOpen(index)}
      aria-label={`Open image ${index + 1}`}
      className={cn(
        "group/tile relative aspect-[4/5] h-[clamp(11rem,34svh,22rem)] shrink-0 cursor-zoom-in overflow-hidden rounded-[1rem] outline-none",
        "transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 focus-visible:-translate-y-2",
        "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_30px_60px_-30px_rgb(0_0_0/0.9)] focus-visible:ring-2 focus-visible:ring-[#7ce9ff]/70",
        logo ? "bg-[radial-gradient(90%_70%_at_50%_30%,rgb(255_255_255/0.09),rgb(255_255_255/0.02)_70%)]" : "bg-white/[0.03]",
      )}
    >
      <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-[1.07]">
        {logo ? (
          <div className="absolute inset-[16%]">
            <Image src={image.src} alt="" fill sizes="(min-width: 1024px) 16vw, 30vw" className="object-contain drop-shadow-[0_10px_24px_rgb(0_0_0/0.45)]" />
          </div>
        ) : (
          <Image src={image.src} alt="" fill sizes="(min-width: 1024px) 22vw, 40vw" className="object-cover" />
        )}
      </div>

      {/* light sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-full -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.16),transparent)] opacity-0 transition-[translate,opacity] duration-[900ms] ease-out group-hover/tile:translate-x-[200%] group-hover/tile:opacity-100"
      />
      {/* accent rim */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_0_1px_rgb(124_233_255/0.55),inset_0_0_40px_rgb(123_97_255/0.25)] transition-opacity duration-500 group-hover/tile:opacity-100"
      />
      {/* open button */}
      <span className="pointer-events-none absolute bottom-3 right-3 grid size-9 translate-y-2 place-items-center rounded-full bg-black/50 text-white opacity-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.18)] transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:translate-y-0 group-hover/tile:opacity-100">
        <PlusIcon className="size-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}
