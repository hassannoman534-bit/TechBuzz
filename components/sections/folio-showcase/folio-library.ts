import fs from "node:fs";
import path from "node:path";
import type { FolioChapterConfig, FolioRule, FolioShowcaseContent } from "./folio-showcase.config";

export type FolioImage = { src: string; /** logos are shown whole, not cropped */ fit: "cover" | "contain" };

export type FolioChapterData = {
  id: string;
  title: [string, string];
  caption: string;
  /** The growing card */
  cover: FolioImage;
  /** Big dim image behind the card (same as the cover unless key art is set) */
  backdrop: string;
  images: FolioImage[];
  count: number;
};

type Row = { page: string; section: string; file: string };

const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

/** Minimal CSV reader for the downloader manifest (quoted fields, commas inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

/** Rows from manifest.csv, or (no manifest) one row per image found in the section folders. */
function readRows(dir: string): Row[] {
  const manifest = path.join(dir, "manifest.csv");
  if (fs.existsSync(manifest)) {
    const [head, ...body] = parseCsv(fs.readFileSync(manifest, "utf8"));
    const col = (name: string): number => head.indexOf(name);
    const [pi, si, fi] = [col("page"), col("section"), col("file")];
    return body
      .map((r) => ({ page: r[pi] ?? "", section: r[si] ?? "", file: (r[fi] ?? "").replace(/\\/g, "/") }))
      .filter((r) => IMAGE.test(r.file) && fs.existsSync(path.join(dir, r.file)));
  }
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      fs
        .readdirSync(path.join(dir, d.name))
        .filter((f) => IMAGE.test(f))
        .sort()
        .map((f) => ({ page: "", section: d.name.replace(/^\d+_/, ""), file: `${d.name}/${f}` })),
    );
}

function matches(rule: FolioRule, row: Row): boolean {
  const section = row.section.toLowerCase();
  if (rule.sections?.some((w) => section.includes(w))) return true;
  return Boolean(row.page && rule.pages?.includes(row.page));
}

const toUrl = (root: string, file: string): string =>
  `/${root}/${file.split("/").map(encodeURIComponent).join("/")}`;

/**
 * Sorts every downloaded image into a folio chapter. Runs on the server at build time
 * (static page), so adding images only needs a rebuild. Chapters without images are left out.
 */
export function loadFolioChapters(content: FolioShowcaseContent): FolioChapterData[] {
  const dir = path.join(process.cwd(), "public", content.root);
  const rows = readRows(dir).filter((r) => !content.ignoreSections.some((w) => r.section.toLowerCase().includes(w)));

  const byId = new Map<string, Row[]>(content.chapters.map((c) => [c.id, []]));
  const ordered = content.matchOrder
    .map((id) => content.chapters.find((c) => c.id === id))
    .filter((c): c is FolioChapterConfig => Boolean(c));
  for (const row of rows) {
    const chapter = ordered.find((c) => matches(c.match, row));
    if (chapter) byId.get(chapter.id)?.push(row);
  }

  const fitOf = (row: Row): FolioImage["fit"] =>
    content.logoSections.some((w) => row.section.toLowerCase().includes(w)) ? "contain" : "cover";
  const image = (row: Row): FolioImage => ({ src: toUrl(content.root, row.file), fit: fitOf(row) });
  const artExists = (art?: string): art is string =>
    Boolean(art && fs.existsSync(path.join(process.cwd(), "public", decodeURIComponent(art))));

  return content.chapters.flatMap((c) => {
    const list = byId.get(c.id) ?? [];
    const hasArt = artExists(c.art);
    if (!list.length && !hasArt) return [];

    if (hasArt) {
      const art = c.art as string;
      return [
        {
          id: c.id,
          title: c.title,
          caption: c.caption,
          cover: { src: art, fit: "cover" as const },
          backdrop: art,
          images: list.slice(0, content.stripLimit).map(image),
          count: list.length,
        },
      ];
    }

    // No key art: the best non logo image becomes the cover (a cropped logo makes a poor cover).
    const coverRow =
      (c.cover && list.find((r) => r.file.endsWith(c.cover as string))) ||
      list.find((r) => fitOf(r) === "cover") ||
      list[0];
    const rest = list.filter((r) => r !== coverRow);
    const cover = image(coverRow);
    return [
      {
        id: c.id,
        title: c.title,
        caption: c.caption,
        cover,
        backdrop: cover.src,
        images: rest.slice(0, content.stripLimit).map(image),
        count: list.length,
      },
    ];
  });
}
