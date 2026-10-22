/**
 * Prepares client logos for the client wall.
 *
 *   node scripts/trim-logos.mjs [inputDir] [outputDir]
 *   defaults: public/assets/logos  ->  public/assets/logos/trimmed
 *
 * For every PNG / WebP / JPG in the input folder (originals are never changed):
 * 1. If the image has no transparency and a near-white background, the background is made transparent.
 * 2. Empty space around the logo is trimmed away, so the logo fills its tile.
 * 3. The result is saved as PNG in the output folder.
 * SVGs are copied as is (trim their viewBox by hand if they have padding).
 * Prints a config snippet with the trimmed width and height, and flags duplicate logos.
 * Needs sharp: npm i -D sharp
 */
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const input = process.argv[2] ?? "public/assets/logos";
const output = process.argv[3] ?? path.join(input, "trimmed");
const WHITE = 235; // a pixel brighter than this on all channels counts as background
const RASTER = new Set([".png", ".webp", ".jpg", ".jpeg"]);

const slug = (name) =>
  name.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "logo";

async function knockOutWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => (y * info.width + x) * 4;
  const corners = [px(0, 0), px(info.width - 1, 0), px(0, info.height - 1), px(info.width - 1, info.height - 1)];
  const opaqueWhiteCorners = corners.every((i) => data[i + 3] > 250 && data[i] > WHITE && data[i + 1] > WHITE && data[i + 2] > WHITE);
  if (!opaqueWhiteCorners) return { image: sharp(file), knocked: false };
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > WHITE && data[i + 1] > WHITE && data[i + 2] > WHITE) data[i + 3] = 0;
  }
  return { image: sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }), knocked: true };
}

await mkdir(output, { recursive: true });
const files = (await readdir(input, { withFileTypes: true })).filter((d) => d.isFile()).map((d) => d.name).sort();
const seen = new Map();
const entries = [];

for (const name of files) {
  const ext = path.extname(name).toLowerCase();
  const src = path.join(input, name);
  if (ext === ".svg") {
    const out = `${slug(name)}.svg`;
    await copyFile(src, path.join(output, out));
    entries.push({ file: name, out, note: "svg copied as is" });
    continue;
  }
  if (!RASTER.has(ext)) continue;

  const { image, knocked } = await knockOutWhite(src);
  const buf = await image.png().toBuffer();
  const trimmed = await sharp(buf).trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true });
  const out = `${slug(name)}.png`;
  await sharp(trimmed.data).toFile(path.join(output, out));

  const before = await sharp(src).metadata();
  const hash = createHash("sha1").update(trimmed.data).digest("hex");
  const dupe = seen.get(hash);
  seen.set(hash, name);
  entries.push({
    file: name,
    out,
    width: trimmed.info.width,
    height: trimmed.info.height,
    note: [
      `${before.width}x${before.height} -> ${trimmed.info.width}x${trimmed.info.height}`,
      knocked && "white background removed",
      dupe && `DUPLICATE of ${dupe}`,
    ].filter(Boolean).join(", "),
  });
}

const publicDir = path.resolve("public");
for (const e of entries) console.log(`${e.file}: ${e.note}`);
console.log("\nConfig snippet (fill in the names):\n");
for (const e of entries) {
  const url = "/" + path.relative(publicDir, path.resolve(output, e.out)).split(path.sep).join("/");
  const size = e.width ? `, width: ${e.width}, height: ${e.height}` : "";
  console.log(`{ name: "TODO ${e.file}", logo: { src: "${url}"${size} } },`);
}
