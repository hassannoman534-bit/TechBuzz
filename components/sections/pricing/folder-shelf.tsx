"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import GlassFolder, { type FolderFile } from "@/components/ui/glass-folder";
import { cn } from "@/lib/utils";
import { folderArt, folderLabel } from "./pricing-folders.config";
import { money, slotKey, type PricingState } from "./pricing-logic";
import type { PricingContent, PricingService } from "./pricing.config";

type FolderShelfProps = {
  content: PricingContent;
  state: PricingState;
  onOpen: (serviceIndex: number) => void;
  /** Space taken above and below the shelf on desktop, so both rows fit one screen */
  reservedPx?: number;
  /** Rendered above the grid at exactly the grid's width, so its left edge lines up with the folders */
  header?: ReactNode;
};

const RATIO = 326 / 340; // folder height / width (incl. the headroom for the files)
const CAPTION = 44; // px under each folder
const GAP_X = 28;
const GAP_Y = 18;

/** Lowest priced package of a service (null when every package is a custom quote). */
function fromPrice(svc: PricingService): number | null {
  const prices = svc.subs.flatMap((s) => s.pkgs.map((p) => p.price).filter((p): p is number => p !== null));
  return prices.length ? Math.min(...prices) : null;
}

/** What peeks out of a folder: its packages (one tab services) or its tabs (YouTube). */
function filesFor(svc: PricingService): FolderFile[] {
  if (svc.subs.length === 1) {
    return svc.subs[0].pkgs.map((p) => ({ name: p.name, meta: p.price === null ? "Custom" : money(p.price) }));
  }
  return svc.subs.map((s) => {
    const prices = s.pkgs.map((p) => p.price).filter((p): p is number => p !== null);
    return { name: s.label, meta: prices.length ? `from ${money(Math.min(...prices))}` : "Custom" };
  });
}

/**
 * The eight services as smoked glass folders, four per row on desktop, two on phones and tablets.
 * Hover leans the glass and lifts the packages out of the pocket; a click opens the service dialog.
 * Folder width follows the container (and, on desktop, the screen height so both rows fit one screen).
 */
export function FolderShelf({ content, state, onOpen, reservedPx = 330, header }: FolderShelfProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ width: 0, cols: 4 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = (): void => {
      const cols = window.innerWidth >= 1024 ? 4 : 2;
      const gap = cols === 4 ? GAP_X : 14;
      const byWidth = (el.clientWidth - gap * (cols - 1)) / cols;
      const rows = Math.ceil(content.services.length / cols);
      const byHeight = cols === 4 ? ((window.innerHeight - reservedPx) / rows - CAPTION - GAP_Y) / RATIO : Infinity;
      // desktop: fit both rows on screen, but never below 210px (short screens scroll instead)
      const floor = cols === 4 ? Math.min(210, byWidth) : 140;
      const width = Math.floor(Math.max(floor, Math.min(byWidth, byHeight, 340)));
      setLayout((l) => (l.width === width && l.cols === cols ? l : { width, cols }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [content.services.length, reservedPx]);

  // stable file lists, so the controlled folders only update when the data changes
  const files = useMemo(() => content.services.map(filesFor), [content]);

  const gap = layout.cols === 4 ? GAP_X : 14;
  const total = layout.width ? layout.width * layout.cols + gap * (layout.cols - 1) : undefined;

  return (
    <div ref={boxRef} className="w-full">
      <div className="mx-auto max-w-full" style={{ width: total }}>
        {header}
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: layout.width ? `repeat(${layout.cols}, ${layout.width}px)` : `repeat(${layout.cols}, minmax(0, 1fr))`,
            columnGap: gap,
            rowGap: GAP_Y,
          }}
        >
      {content.services.map((svc, si) => {
        const multi = svc.subs.length > 1;
        const selected = multi
          ? svc.subs.flatMap((_, bi) => (state.picked[slotKey(si, bi)] !== undefined ? [bi] : []))
          : state.picked[slotKey(si, 0)] !== undefined
            ? [state.picked[slotKey(si, 0)]]
            : [];
        const pickedName = !multi && selected.length ? svc.subs[0].pkgs[selected[0]].name : multi && selected.length ? `${selected.length} picked` : null;
        const price = fromPrice(svc);
        const small = layout.width > 0 && layout.width < 230;
        const look = folderArt[svc.id];

        return (
          <div key={svc.id} className="flex min-w-0 flex-col items-center">
            <div style={{ width: layout.width || "100%", aspectRatio: `${340} / ${326}` }}>
              {layout.width > 0 && (
                <GlassFolder
                  label={folderLabel[svc.id] ?? svc.label}
                  peek
                  meta={multi ? `${svc.subs.length} options` : `${svc.subs[0].pkgs.length} packages`}
                  tone="dark"
                  art={look.art}
                  seed={look.seed}
                  files={files[si]}
                  selected={selected}
                  action="none"
                  width={layout.width}
                  hideLabel={small}
                  appearDelay={si * 70}
                  onActivate={() => onOpen(si)}
                />
              )}
            </div>

            {/* caption: one line, never wraps */}
            <div className="mt-2 flex w-full items-center justify-between gap-2 whitespace-nowrap px-1 font-footer-text text-[0.78rem]" style={{ maxWidth: layout.width || undefined }}>
              <span className={cn("min-w-0 truncate", small ? "font-medium text-white" : "text-white/45")}>{small ? (folderLabel[svc.id] ?? svc.label) : price !== null ? `From ${money(price)}` : "Custom quote"}</span>
              {pickedName ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#7b61ff]/15 px-2 py-0.5 text-[0.7rem] font-medium text-[#c9c2ff] ring-1 ring-[#7b61ff]/40">
                  <Check className="size-3" strokeWidth={2.6} />
                  {pickedName}
                </span>
              ) : (
                small && price !== null && <span className="shrink-0 text-white/45">{money(price)}+</span>
              )}
            </div>
          </div>
        );
      })}
        </div>
      </div>
    </div>
  );
}
